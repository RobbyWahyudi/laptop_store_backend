import { AnalyticsService } from "@/services/analytics.service";
import { authenticate } from "@/lib/auth";
import { successResponse, errorResponse, getQueryParams } from "@/lib/utils";

// GET sales chart data
export async function GET(request) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    const params = getQueryParams(request);
    const period = params.period || "weekly"; // weekly, monthly, yearly

    const { data, error } = await AnalyticsService.getSalesChart(period);

    if (error) {
      return errorResponse(error, 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Sales chart error:", error);
    return errorResponse("Internal server error", 500);
  }
}
