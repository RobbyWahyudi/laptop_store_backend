import { supabaseAdmin } from "@/lib/supabase";
import { comparePassword, generateToken } from "@/lib/auth";
import { validate, loginSchema } from "@/lib/validations";
import { successResponse, errorResponse, getRequestBody } from "@/lib/utils";

export async function POST(request) {
  try {
    const body = await getRequestBody(request);

    // Validate input
    const validation = validate(loginSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.errors);
    }

    const { email, password } = validation.data;

    // Get user by email
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return errorResponse("Invalid credentials", 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return errorResponse("Invalid credentials", 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data without password
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };

    return successResponse(userData, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
