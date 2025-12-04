import { supabaseAdmin } from "@/lib/supabase";
import { authenticate } from "@/lib/auth";
import { validate, categorySchema } from "@/lib/validations";
import { successResponse, errorResponse, getRequestBody } from "@/lib/utils";

// GET all laptop categories
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from("laptop_categories")
      .select("*")
      .order("name");

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Get categories error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST create new laptop category
export async function POST(request) {
  try {
    // Authenticate and authorize
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    // Only admin can create categories
    if (user.role !== "admin") {
      return errorResponse("Insufficient permissions", 403);
    }

    const body = await getRequestBody(request);

    // Validate category data
    const validation = validate(categorySchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.errors);
    }

    const { data, error } = await supabaseAdmin
      .from("laptop_categories")
      .insert([{ name: validation.data.name }])
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data, "Category created successfully");
  } catch (error) {
    console.error("Create category error:", error);
    return errorResponse("Internal server error", 500);
  }
}
