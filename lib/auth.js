import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "./supabase";
import { errorResponse } from "./utils";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Hash password
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get user from token
export async function getUserFromToken(token) {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, name, email, role")
    .eq("id", decoded.userId)
    .single();

  if (error) return null;
  return data;
}

// Authentication middleware
export async function authenticate(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "No token provided" };
  }

  const token = authHeader.substring(7);
  const user = await getUserFromToken(token);

  if (!user) {
    return { user: null, error: "Invalid or expired token" };
  }

  return { user, error: null };
}

// Role-based authorization
export function authorize(allowedRoles = []) {
  return async (request) => {
    const { user, error } = await authenticate(request);

    if (error) {
      return errorResponse(error, 401);
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return errorResponse("Insufficient permissions", 403);
    }

    return { user, error: null };
  };
}

// Check if user has specific role
export function hasRole(user, role) {
  return user && user.role === role;
}

// Check if user is admin
export function isAdmin(user) {
  return hasRole(user, "admin");
}

// Check if user is cashier or admin
export function isCashierOrAdmin(user) {
  return user && (user.role === "admin" || user.role === "kasir");
}
