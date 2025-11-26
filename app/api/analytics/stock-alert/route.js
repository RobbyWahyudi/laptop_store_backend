import { AnalyticsService } from "@/services/analytics.service";
import { authenticate } from "@/lib/auth";
import { successResponse, errorResponse, getQueryParams } from "@/lib/utils";

// GET low stock alerts
export async function GET(request) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    const params = getQueryParams(request);
    const threshold = parseInt(params.threshold) || 10;

    const { data, error } = await AnalyticsService.getLowStockAlerts(threshold);

    if (error) {
      return errorResponse(error, 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Low stock alerts error:", error);
    return errorResponse("Internal server error", 500);
  }
}
