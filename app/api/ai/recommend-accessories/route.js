import { AIService } from "@/services/ai.service";
import { successResponse, errorResponse, getQueryParams } from "@/lib/utils";

// GET accessory recommendations for a laptop
export async function GET(request) {
  try {
    const params = getQueryParams(request);
    const laptopId = parseInt(params.laptop_id);

    if (!laptopId) {
      return errorResponse("laptop_id is required", 400);
    }

    const { data, error } = await AIService.recommendAccessories(laptopId);

    if (error) {
      return errorResponse(error, 500);
    }

    return successResponse(data, "Accessory recommendations generated");
  } catch (error) {
    console.error("Accessory recommendation error:", error);
    return errorResponse("Internal server error", 500);
  }
}
