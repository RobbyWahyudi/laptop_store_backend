import { AnalyticsService } from "@/services/analytics.service";
import { authenticate } from "@/lib/auth";
import { successResponse, errorResponse, getQueryParams } from "@/lib/utils";

// GET top selling products
export async function GET(request) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    const params = getQueryParams(request);
    const limit = parseInt(params.limit) || 10;
    const type = params.type || "all"; // all, laptop, accessory

    const { data, error } = await AnalyticsService.getTopSellingProducts(
      limit,
      type
    );

    if (error) {
      return errorResponse(error, 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Top selling products error:", error);
    return errorResponse("Internal server error", 500);
  }
}
