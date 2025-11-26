import { AnalyticsService } from "@/services/analytics.service";
import { authenticate } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

// GET dashboard overview
export async function GET(request) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    const { data, error } = await AnalyticsService.getDashboardOverview();

    if (error) {
      return errorResponse(error, 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return errorResponse("Internal server error", 500);
  }
}
