import { AIService } from "@/services/ai.service";
import { validate, aiRecommendationSchema } from "@/lib/validations";
import { successResponse, errorResponse, getRequestBody } from "@/lib/utils";

// POST get AI laptop recommendations
export async function POST(request) {
  try {
    const body = await getRequestBody(request);

    // Validate input
    const validation = validate(aiRecommendationSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.errors);
    }

    const { data, error } = await AIService.recommendLaptop(validation.data);

    if (error) {
      return errorResponse(error, 500);
    }

    return successResponse(data, "Recommendations generated successfully");
  } catch (error) {
    console.error("AI recommendation error:", error);
    return errorResponse("Internal server error", 500);
  }
}
