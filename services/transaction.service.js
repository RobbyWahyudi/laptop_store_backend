import { supabaseAdmin } from "@/lib/supabase";
import { LaptopService, AccessoryService } from "./product.service";

export const TransactionService = {
  async create(transactionData, cashierId) {
    const { customer_name, payment_method, items, total_price } =
      transactionData;

    // Validate stock availability
    for (const item of items) {
      if (item.product_type === "laptop") {
        const { data: laptop } = await LaptopService.getById(item.product_id);
        if (!laptop || laptop.stock < item.qty) {
          return {
            data: null,
            error: `Insufficient stock for ${laptop?.name || "product"}`,
          };
        }
      } else if (item.product_type === "accessory") {
        const { data: accessory } = await AccessoryService.getById(
          item.product_id
        );
        if (!accessory || accessory.stock < item.qty) {
          return {
            data: null,
            error: `Insufficient stock for ${accessory?.name || "product"}`,
          };
        }
      }
    }

    // Create transaction
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("transactions")
      .insert([
        {
          cashier_id: cashierId,
          customer_name: customer_name || null,
          total_price,
          payment_method,
        },
      ])
      .select()
      .single();

    if (txError) {
      return { data: null, error: txError.message };
    }

    // Create transaction items and update stock
    const transactionItems = [];
    for (const item of items) {
      // Insert transaction item
      const { data: txItem, error: itemError } = await supabaseAdmin
        .from("transaction_items")
        .insert([
          {
            transaction_id: transaction.id,
            product_type: item.product_type,
            product_id: item.product_id,
            qty: item.qty,
            price: item.price,
          },
        ])
        .select()
        .single();

      if (itemError) {
        // Rollback: delete transaction
        await this.delete(transaction.id);
        return { data: null, error: itemError.message };
      }

      transactionItems.push(txItem);

      // Update stock
      if (item.product_type === "laptop") {
        const { error: stockError } = await LaptopService.updateStock(
          item.product_id,
          item.qty,
          "decrease"
        );
        if (stockError) {
          await this.delete(transaction.id);
          return { data: null, error: stockError };
        }
        // Log stock change
        await LaptopService.logStockChange(
          item.product_id,
          "sold",
          item.qty,
          `Sold in transaction ${transaction.id}`
        );
      } else if (item.product_type === "accessory") {
        const { error: stockError } = await AccessoryService.updateStock(
          item.product_id,
          item.qty,
          "decrease"
        );
        if (stockError) {
          await this.delete(transaction.id);
          return { data: null, error: stockError };
        }
        // Log stock change
        await AccessoryService.logStockChange(
          item.product_id,
          "sold",
          item.qty,
          `Sold in transaction ${transaction.id}`
        );
      }
    }

    // Return complete transaction with items
    return {
      data: {
        ...transaction,
        items: transactionItems,
      },
      error: null,
    };
  },

  async getAll(filters = {}) {
    let query = supabaseAdmin.from("transactions").select(`
        *,
        users(name, email),
        transaction_items(
          *
        )
      `);

    // Filters
    if (filters.cashier_id) {
      query = query.eq("cashier_id", filters.cashier_id);
    }
    if (filters.payment_method) {
      query = query.eq("payment_method", filters.payment_method);
    }
    if (filters.date_from) {
      query = query.gte("created_at", filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte("created_at", filters.date_to);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    // Enrich transaction items with product details
    if (data) {
      for (const transaction of data) {
        for (const item of transaction.transaction_items) {
          if (item.product_type === "laptop") {
            const { data: laptop } = await LaptopService.getById(
              item.product_id
            );
            item.product_details = laptop;
          } else if (item.product_type === "accessory") {
            const { data: accessory } = await AccessoryService.getById(
              item.product_id
            );
            item.product_details = accessory;
          }
        }
      }
    }

    return { data, error };
  },

  async getById(id) {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select(
        `
        *,
        users(name, email),
        transaction_items(*)
      `
      )
      .eq("id", id)
      .single();

    // Enrich with product details
    if (data) {
      for (const item of data.transaction_items) {
        if (item.product_type === "laptop") {
          const { data: laptop } = await LaptopService.getById(item.product_id);
          item.product_details = laptop;
        } else if (item.product_type === "accessory") {
          const { data: accessory } = await AccessoryService.getById(
            item.product_id
          );
          item.product_details = accessory;
        }
      }
    }

    return { data, error };
  },

  async void(id, reason = "Voided by admin") {
    // Get transaction with items
    const { data: transaction, error: txError } = await this.getById(id);

    if (txError || !transaction) {
      return { data: null, error: "Transaction not found" };
    }

    // Restore stock for each item
    for (const item of transaction.transaction_items) {
      if (item.product_type === "laptop") {
        await LaptopService.updateStock(item.product_id, item.qty, "increase");
        await LaptopService.logStockChange(
          item.product_id,
          "add",
          item.qty,
          `Voided from transaction ${id}: ${reason}`
        );
      } else if (item.product_type === "accessory") {
        await AccessoryService.updateStock(
          item.product_id,
          item.qty,
          "increase"
        );
        await AccessoryService.logStockChange(
          item.product_id,
          "add",
          item.qty,
          `Voided from transaction ${id}: ${reason}`
        );
      }
    }

    // Delete transaction (cascade will delete items)
    const { error: deleteError } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { data: null, error: deleteError.message };
    }

    return { data: { voided: true, transaction_id: id }, error: null };
  },

  async delete(id) {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("total_price")
      .gte("created_at", today.toISOString());

    if (error) return { data: null, error };

    const totalSales = data.reduce(
      (sum, tx) => sum + parseFloat(tx.total_price),
      0
    );
    const totalTransactions = data.length;

    return {
      data: {
        total_sales: totalSales,
        total_transactions: totalTransactions,
        average_transaction:
          totalTransactions > 0 ? totalSales / totalTransactions : 0,
      },
      error: null,
    };
  },
};
