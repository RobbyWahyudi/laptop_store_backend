import { z } from "zod";

// User validations
export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "kasir", "owner"]).optional().default("kasir"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Laptop validations
export const laptopSchema = z.object({
  name: z.string().min(1, "Laptop name is required"),
  brand: z.string().min(1, "Brand is required"),
  cpu: z.string().optional(),
  gpu: z.string().optional(),
  ram: z.number().int().positive().optional(),
  storage: z.string().optional(),
  display: z.string().optional(),
  weight: z.number().positive().optional(),
  os: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0).optional().default(0),
  image_url: z.string().url().optional().or(z.literal("")),
  category_id: z.number().int().positive().optional(),
});

export const laptopUpdateSchema = laptopSchema.partial();

// Accessory validations
export const accessorySchema = z.object({
  name: z.string().min(1, "Accessory name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0).optional().default(0),
  image_url: z.string().url().optional().or(z.literal("")),
});

export const accessoryUpdateSchema = accessorySchema.partial();

// Transaction validations
export const transactionItemSchema = z.object({
  product_type: z.enum(["laptop", "accessory"]),
  product_id: z.number().int().positive(),
  qty: z.number().int().positive(),
  price: z.number().positive(),
});

export const transactionSchema = z.object({
  customer_name: z.string().optional(),
  payment_method: z.enum(["cash", "qris", "transfer"]),
  items: z.array(transactionItemSchema).min(1, "At least one item is required"),
  total_price: z.number().positive(),
});

// AI Recommendation validation
export const aiRecommendationSchema = z.object({
  need: z
    .enum(["gaming", "editing", "programming", "office", "bisnis"])
    .optional(),
  min_budget: z.number().positive().optional(),
  max_budget: z.number().positive().optional(),
  min_ram: z.number().int().positive().optional(),
  min_storage: z.string().optional(),
  brand_preference: z.string().optional(),
});

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

// Validate function helper
export function validate(schema, data) {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: "unknown", message: "Validation failed" }],
    };
  }
}
