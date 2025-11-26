import { authenticate } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(request) {
  const { user, error } = await authenticate(request);

  if (error) {
    return errorResponse(error, 401);
  }

  return successResponse(user, "User fetched successfully");
}
