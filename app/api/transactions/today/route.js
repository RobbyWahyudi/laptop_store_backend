import { TransactionService } from "@/services/transaction.service";
import { authenticate } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

// GET today's transaction stats
export async function GET(request) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    const { data, error } = await TransactionService.getTodayStats();

    if (error) {
      return errorResponse(error, 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Get today stats error:", error);
    return errorResponse("Internal server error", 500);
  }
}
