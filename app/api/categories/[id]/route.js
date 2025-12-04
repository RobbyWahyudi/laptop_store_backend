import { supabaseAdmin } from "@/lib/supabase";
import { authenticate } from "@/lib/auth";
import { validate, categorySchema } from "@/lib/validations";
import { successResponse, errorResponse, getRequestBody } from "@/lib/utils";

// GET category by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const { data, error } = await supabaseAdmin
      .from("laptop_categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return errorResponse("Category not found", 404);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Get category error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT update category
export async function PUT(request, { params }) {
  try {
    // Authenticate and authorize
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    // Only admin can update categories
    if (user.role !== "admin") {
      return errorResponse("Insufficient permissions", 403);
    }

    const { id } = params;
    const body = await getRequestBody(request);

    // Validate category data
    const validation = validate(categorySchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.errors);
    }

    const { data, error } = await supabaseAdmin
      .from("laptop_categories")
      .update({ name: validation.data.name })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    if (!data) {
      return errorResponse("Category not found", 404);
    }

    return successResponse(data, "Category updated successfully");
  } catch (error) {
    console.error("Update category error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE category
export async function DELETE(request, { params }) {
  try {
    // Authenticate and authorize
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    // Only admin can delete categories
    if (user.role !== "admin") {
      return errorResponse("Insufficient permissions", 403);
    }

    const { id } = params;

    const { data, error } = await supabaseAdmin
      .from("laptop_categories")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    if (!data) {
      return errorResponse("Category not found", 404);
    }

    return successResponse(null, "Category deleted successfully");
  } catch (error) {
    console.error("Delete category error:", error);
    return errorResponse("Internal server error", 500);
  }
}
