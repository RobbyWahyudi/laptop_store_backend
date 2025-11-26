import { successResponse } from "@/lib/utils";

export async function POST(request) {
  // In JWT-based auth, logout is handled client-side by removing the token
  // This endpoint is here for consistency and can be extended for token blacklisting
  return successResponse(null, "Logout successful");
}
