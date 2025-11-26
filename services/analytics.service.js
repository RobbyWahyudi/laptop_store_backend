import { supabaseAdmin } from "@/lib/supabase";

export const AnalyticsService = {
  // Get sales summary for a period
  async getSalesSummary(period = "daily") {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "daily":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "yearly":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const { data: transactions, error } = await supabaseAdmin
      .from("transactions")
      .select("total_price, created_at, payment_method")
      .gte("created_at", startDate.toISOString());

    if (error) {
      return { data: null, error: error.message };
    }

    const totalSales = transactions.reduce(
      (sum, tx) => sum + parseFloat(tx.total_price),
      0
    );
    const totalTransactions = transactions.length;
    const averageTransaction =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Payment method breakdown
    const paymentBreakdown = transactions.reduce((acc, tx) => {
      acc[tx.payment_method] = (acc[tx.payment_method] || 0) + 1;
      return acc;
    }, {});

    return {
      data: {
        period,
        total_sales: totalSales,
        total_transactions: totalTransactions,
        average_transaction: averageTransaction,
        payment_breakdown: paymentBreakdown,
        start_date: startDate,
        end_date: now,
      },
      error: null,
    };
  },

  // Get top selling products
  async getTopSellingProducts(limit = 10, productType = "all") {
    let query = supabaseAdmin
      .from("transaction_items")
      .select("product_id, product_type, qty, price");

    if (productType !== "all") {
      query = query.eq("product_type", productType);
    }

    const { data: items, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    // Aggregate by product
    const productStats = {};
    for (const item of items) {
      const key = `${item.product_type}-${item.product_id}`;
      if (!productStats[key]) {
        productStats[key] = {
          product_type: item.product_type,
          product_id: item.product_id,
          total_qty: 0,
          total_revenue: 0,
          transaction_count: 0,
        };
      }
      productStats[key].total_qty += item.qty;
      productStats[key].total_revenue += parseFloat(item.price) * item.qty;
      productStats[key].transaction_count += 1;
    }

    // Convert to array and sort by revenue
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, limit);

    // Enrich with product details
    for (const product of topProducts) {
      if (product.product_type === "laptop") {
        const { data: laptop } = await supabaseAdmin
          .from("laptops")
          .select("name, brand, price")
          .eq("id", product.product_id)
          .single();
        product.details = laptop;
      } else if (product.product_type === "accessory") {
        const { data: accessory } = await supabaseAdmin
          .from("accessories")
          .select("name, category, price")
          .eq("id", product.product_id)
          .single();
        product.details = accessory;
      }
    }

    return { data: topProducts, error: null };
  },

  // Get low stock alerts
  async getLowStockAlerts(threshold = 10) {
    const { data: laptops } = await supabaseAdmin
      .from("laptops")
      .select("id, name, brand, stock, price")
      .lte("stock", threshold)
      .order("stock", { ascending: true });

    const { data: accessories } = await supabaseAdmin
      .from("accessories")
      .select("id, name, category, stock, price")
      .lte("stock", threshold)
      .order("stock", { ascending: true });

    return {
      data: {
        laptops: laptops || [],
        accessories: accessories || [],
        total_alerts: (laptops?.length || 0) + (accessories?.length || 0),
      },
      error: null,
    };
  },

  // Get sales chart data
  async getSalesChart(period = "weekly") {
    const now = new Date();
    let startDate = new Date();
    let groupBy = "day";

    switch (period) {
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        groupBy = "day";
        break;
      case "monthly":
        startDate.setMonth(now.getMonth() - 1);
        groupBy = "day";
        break;
      case "yearly":
        startDate.setFullYear(now.getFullYear() - 1);
        groupBy = "month";
        break;
    }

    const { data: transactions, error } = await supabaseAdmin
      .from("transactions")
      .select("total_price, created_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at");

    if (error) {
      return { data: null, error: error.message };
    }

    // Group by date
    const chartData = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.created_at);
      let key;

      if (groupBy === "day") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`; // YYYY-MM
      }

      if (!chartData[key]) {
        chartData[key] = {
          date: key,
          total_sales: 0,
          transaction_count: 0,
        };
      }

      chartData[key].total_sales += parseFloat(tx.total_price);
      chartData[key].transaction_count += 1;
    });

    return {
      data: Object.values(chartData),
      error: null,
    };
  },

  // Get cashier performance
  async getCashierPerformance(startDate, endDate) {
    let query = supabaseAdmin.from("transactions").select(`
        cashier_id,
        total_price,
        users(name, email)
      `);

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: transactions, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    // Aggregate by cashier
    const cashierStats = {};
    transactions.forEach((tx) => {
      if (!cashierStats[tx.cashier_id]) {
        cashierStats[tx.cashier_id] = {
          cashier_id: tx.cashier_id,
          cashier_name: tx.users?.name || "Unknown",
          cashier_email: tx.users?.email || "",
          total_sales: 0,
          transaction_count: 0,
        };
      }

      cashierStats[tx.cashier_id].total_sales += parseFloat(tx.total_price);
      cashierStats[tx.cashier_id].transaction_count += 1;
    });

    const performance = Object.values(cashierStats)
      .map((stat) => ({
        ...stat,
        average_transaction:
          stat.transaction_count > 0
            ? stat.total_sales / stat.transaction_count
            : 0,
      }))
      .sort((a, b) => b.total_sales - a.total_sales);

    return { data: performance, error: null };
  },

  // Get dashboard overview
  async getDashboardOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Today's sales
    const { data: todaySales } = await this.getSalesSummary("daily");

    // This month's sales
    const { data: monthSales } = await this.getSalesSummary("monthly");

    // Top selling products
    const { data: topProducts } = await this.getTopSellingProducts(5);

    // Low stock alerts
    const { data: lowStock } = await this.getLowStockAlerts(10);

    // Total products
    const { count: laptopCount } = await supabaseAdmin
      .from("laptops")
      .select("*", { count: "exact", head: true });

    const { count: accessoryCount } = await supabaseAdmin
      .from("accessories")
      .select("*", { count: "exact", head: true });

    return {
      data: {
        today: todaySales,
        this_month: monthSales,
        top_products: topProducts,
        low_stock: lowStock,
        product_count: {
          laptops: laptopCount || 0,
          accessories: accessoryCount || 0,
          total: (laptopCount || 0) + (accessoryCount || 0),
        },
      },
      error: null,
    };
  },
};
