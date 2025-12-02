import { LaptopService, AccessoryService } from "@/services/product.service";
import { authenticate } from "@/lib/auth";
import {
  validate,
  laptopUpdateSchema,
  accessoryUpdateSchema,
} from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  getRequestBody,
  getQueryParams,
} from "@/lib/utils";

// GET product by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const queryParams = getQueryParams(request);
    const type = queryParams.type || "laptop";

    let result;
    if (type === "laptop") {
      result = await LaptopService.getById(parseInt(id));
    } else if (type === "accessory") {
      result = await AccessoryService.getById(parseInt(id));
    } else {
      return errorResponse("Invalid product type", 400);
    }

    if (result.error) {
      return errorResponse(result.error, 404);
    }

    return successResponse(result.data);
  } catch (error) {
    console.error("Get product error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT update product
export async function PUT(request, { params }) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    if (user.role !== "admin") {
      return errorResponse("Insufficient permissions", 403);
    }

    const { id } = await params;
    const body = await getRequestBody(request);
    const type = body.type || "laptop";

    let validation, result;

    if (type === "laptop") {
      validation = validate(laptopUpdateSchema, body);
      if (!validation.success) {
        return errorResponse("Validation failed", 400, validation.errors);
      }
      result = await LaptopService.update(parseInt(id), validation.data);
    } else if (type === "accessory") {
      validation = validate(accessoryUpdateSchema, body);
      if (!validation.success) {
        return errorResponse("Validation failed", 400, validation.errors);
      }
      result = await AccessoryService.update(parseInt(id), validation.data);
    } else {
      return errorResponse("Invalid product type", 400);
    }

    if (result.error) {
      return errorResponse(result.error, 500);
    }

    return successResponse(result.data, "Product updated successfully");
  } catch (error) {
    console.error("Update product error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE product
export async function DELETE(request, { params }) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    if (user.role !== "admin") {
      return errorResponse("Insufficient permissions", 403);
    }

    const { id } = await params;
    const queryParams = getQueryParams(request);
    const type = queryParams.type || "laptop";

    let result;
    if (type === "laptop") {
      result = await LaptopService.delete(parseInt(id));
    } else if (type === "accessory") {
      result = await AccessoryService.delete(parseInt(id));
    } else {
      return errorResponse("Invalid product type", 400);
    }

    if (result.error) {
      return errorResponse(result.error, 500);
    }

    return successResponse(null, "Product deleted successfully");
  } catch (error) {
    console.error("Delete product error:", error);
    return errorResponse("Internal server error", 500);
  }
}
