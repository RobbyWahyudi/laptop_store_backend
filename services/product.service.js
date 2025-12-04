import { supabaseAdmin } from "@/lib/supabase";

// Laptop operations
export const LaptopService = {
  async getAll(filters = {}) {
    let query = supabaseAdmin
      .from("laptops")
      .select("*, laptop_categories(name)");

    // Apply filters
    if (filters.brand) {
      query = query.eq("brand", filters.brand);
    }
    if (filters.category_id) {
      query = query.eq("category_id", filters.category_id);
    }
    if (filters.min_price) {
      query = query.gte("price", filters.min_price);
    }
    if (filters.max_price) {
      query = query.lte("price", filters.max_price);
    }
    if (filters.min_ram) {
      query = query.gte("ram", filters.min_ram);
    }
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`
      );
    }
    if (filters.low_stock) {
      query = query.lte("stock", 10);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    return { data, error };
  },

  async getById(id) {
    // Ensure we're querying the correct table
    const { data, error } = await supabaseAdmin
      .from("laptops")
      .select("*, laptop_categories(name)")
      .eq("id", id)
      .single();

    return { data, error };
  },

  async create(laptopData) {
    const { data, error } = await supabaseAdmin
      .from("laptops")
      .insert([laptopData])
      .select("*, laptop_categories(name)")
      .single();

    // Log stock change
    if (data && laptopData.stock > 0) {
      await this.logStockChange(
        data.id,
        "add",
        laptopData.stock,
        "Initial stock"
      );
    }

    return { data, error };
  },

  async update(id, laptopData) {
    // Get current stock
    const { data: current } = await this.getById(id);

    const { data, error } = await supabaseAdmin
      .from("laptops")
      .update(laptopData)
      .eq("id", id)
      .select("*, laptop_categories(name)")
      .single();

    // Log stock change if stock was updated
    if (
      data &&
      current &&
      laptopData.stock !== undefined &&
      laptopData.stock !== current.stock
    ) {
      const change = laptopData.stock - current.stock;
      const changeType = change > 0 ? "add" : "remove";
      await this.logStockChange(
        id,
        changeType,
        Math.abs(change),
        "Stock adjustment"
      );
    }

    return { data, error };
  },

  async delete(id) {
    console.log("LaptopService.delete called with ID:", id);
    // Ensure we're deleting from the correct table
    const { data, error } = await supabaseAdmin
      .from("laptops")
      .delete()
      .eq("id", id)
      .select()
      .single();

    console.log("LaptopService.delete result:", { data, error });
    return { data, error };
  },

  async updateStock(id, quantity, operation = "decrease") {
    const { data: laptop } = await this.getById(id);
    if (!laptop) return { data: null, error: "Laptop not found" };

    const newStock =
      operation === "decrease"
        ? laptop.stock - quantity
        : laptop.stock + quantity;

    if (newStock < 0) {
      return { data: null, error: "Insufficient stock" };
    }

    return await this.update(id, { stock: newStock });
  },

  async logStockChange(productId, changeType, quantity, description) {
    await supabaseAdmin.from("stock_logs").insert([
      {
        product_type: "laptop",
        product_id: productId,
        change_type: changeType,
        quantity,
        description,
      },
    ]);
  },

  async getLowStock(threshold = 10) {
    const { data, error } = await supabaseAdmin
      .from("laptops")
      .select("*")
      .lte("stock", threshold)
      .order("stock", { ascending: true });

    return { data, error };
  },
};

// Accessory operations
export const AccessoryService = {
  async getAll(filters = {}) {
    let query = supabaseAdmin.from("accessories").select("*");

    if (filters.category) {
      query = query.eq("category", filters.category);
    }
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`
      );
    }
    if (filters.low_stock) {
      query = query.lte("stock", 10);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    return { data, error };
  },

  async getById(id) {
    // Ensure we're querying the correct table
    const { data, error } = await supabaseAdmin
      .from("accessories")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  },

  async create(accessoryData) {
    const { data, error } = await supabaseAdmin
      .from("accessories")
      .insert([accessoryData])
      .select()
      .single();

    if (data && accessoryData.stock > 0) {
      await this.logStockChange(
        data.id,
        "add",
        accessoryData.stock,
        "Initial stock"
      );
    }

    return { data, error };
  },

  async update(id, accessoryData) {
    const { data: current } = await this.getById(id);

    const { data, error } = await supabaseAdmin
      .from("accessories")
      .update(accessoryData)
      .eq("id", id)
      .select()
      .single();

    if (
      data &&
      current &&
      accessoryData.stock !== undefined &&
      accessoryData.stock !== current.stock
    ) {
      const change = accessoryData.stock - current.stock;
      const changeType = change > 0 ? "add" : "remove";
      await this.logStockChange(
        id,
        changeType,
        Math.abs(change),
        "Stock adjustment"
      );
    }

    return { data, error };
  },

  async delete(id) {
    console.log("AccessoryService.delete called with ID:", id);
    // Ensure we're deleting from the correct table
    const { data, error } = await supabaseAdmin
      .from("accessories")
      .delete()
      .eq("id", id)
      .select()
      .single();

    console.log("AccessoryService.delete result:", { data, error });
    return { data, error };
  },

  async updateStock(id, quantity, operation = "decrease") {
    const { data: accessory } = await this.getById(id);
    if (!accessory) return { data: null, error: "Accessory not found" };

    const newStock =
      operation === "decrease"
        ? accessory.stock - quantity
        : accessory.stock + quantity;

    if (newStock < 0) {
      return { data: null, error: "Insufficient stock" };
    }

    return await this.update(id, { stock: newStock });
  },

  async logStockChange(productId, changeType, quantity, description) {
    await supabaseAdmin.from("stock_logs").insert([
      {
        product_type: "accessory",
        product_id: productId,
        change_type: changeType,
        quantity,
        description,
      },
    ]);
  },

  async getLowStock(threshold = 10) {
    const { data, error } = await supabaseAdmin
      .from("accessories")
      .select("*")
      .lte("stock", threshold)
      .order("stock", { ascending: true });

    return { data, error };
  },
};

// Category operations
export const CategoryService = {
  async getAll() {
    const { data, error } = await supabaseAdmin
      .from("laptop_categories")
      .select("*")
      .order("name");

    return { data, error };
  },

  async create(name) {
    const { data, error } = await supabaseAdmin
      .from("laptop_categories")
      .insert([{ name }])
      .select()
      .single();

    return { data, error };
  },

  async delete(id) {
    const { data, error } = await supabaseAdmin
      .from("laptop_categories")
      .delete()
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },
};
