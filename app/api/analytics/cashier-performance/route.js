import { AnalyticsService } from "@/services/analytics.service";
import { authenticate } from "@/lib/auth";
import { successResponse, errorResponse, getQueryParams } from "@/lib/utils";

// GET cashier performance
export async function GET(request) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    // Only admin and owner can view cashier performance
    if (user.role !== "admin" && user.role !== "owner") {
      return errorResponse("Insufficient permissions", 403);
    }

    const params = getQueryParams(request);
    const startDate = params.start_date;
    const endDate = params.end_date;

    const { data, error } = await AnalyticsService.getCashierPerformance(
      startDate,
      endDate
    );

    if (error) {
      return errorResponse(error, 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Cashier performance error:", error);
    return errorResponse("Internal server error", 500);
  }
}
