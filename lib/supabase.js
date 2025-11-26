import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role (for backend operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey
);

// Helper function to execute query with error handling
export async function executeQuery(queryFn) {
  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Database query error:", error);
    return { data: null, error: error.message };
  }
}

// Helper to get user from session
export async function getUserFromSession(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error) return null;
  return user;
}
