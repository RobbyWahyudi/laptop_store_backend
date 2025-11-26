import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";
import { validate, registerSchema } from "@/lib/validations";
import { successResponse, errorResponse, getRequestBody } from "@/lib/utils";

export async function POST(request) {
  try {
    const body = await getRequestBody(request);

    // Validate input
    const validation = validate(registerSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.errors);
    }

    const { name, email, password, role } = validation.data;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return errorResponse("Email already registered", 409);
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert([
        {
          name,
          email,
          password_hash,
          role: role || "kasir",
        },
      ])
      .select("id, name, email, role")
      .single();

    if (error) {
      console.error("User creation error:", error);
      return errorResponse("Failed to create user", 500);
    }

    return successResponse(newUser, "User registered successfully");
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("Internal server error", 500);
  }
}
