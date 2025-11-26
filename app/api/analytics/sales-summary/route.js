import { AnalyticsService } from "@/services/analytics.service";
import { authenticate } from "@/lib/auth";
import { successResponse, errorResponse, getQueryParams } from "@/lib/utils";

// GET sales summary
export async function GET(request) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    const params = getQueryParams(request);
    const period = params.period || "daily"; // daily, weekly, monthly, yearly

    const { data, error } = await AnalyticsService.getSalesSummary(period);

    if (error) {
      return errorResponse(error, 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Sales summary error:", error);
    return errorResponse("Internal server error", 500);
  }
}
