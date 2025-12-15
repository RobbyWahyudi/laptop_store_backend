import {
  LaptopService,
  AccessoryService,
  CategoryService,
} from "@/services/product.service";
import { authenticate } from "@/lib/auth";
import {
  validate,
  laptopSchema,
  accessorySchema,
  categorySchema,
} from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  getRequestBody,
  getQueryParams,
} from "@/lib/utils";

// GET all products (laptops and accessories)
export async function GET(request) {
  try {
    const params = getQueryParams(request);
    const type = params.type || "laptop"; // laptop or accessory

    let result;
    if (type === "laptop") {
      result = await LaptopService.getAll(params);
    } else if (type === "accessory") {
      result = await AccessoryService.getAll(params);
    } else if (type === "all") {
      const laptops = await LaptopService.getAll(params);
      const accessories = await AccessoryService.getAll(params);
      result = { data: [...laptops.data, ...accessories.data] };
    } else if (type === "category") {
      result = await CategoryService.getAll();
    } else {
      return errorResponse("Invalid product type", 400);
    }

    if (result.error) {
      return errorResponse(result.error, 500);
    }

    return successResponse(result.data);
  } catch (error) {
    console.error("Get products error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST create new product
export async function POST(request) {
  try {
    // Authenticate and authorize
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    // Only admin can create products
    if (user.role !== "admin") {
      return errorResponse("Insufficient permissions", 403);
    }

    const body = await getRequestBody(request);
    const type = body.type || "laptop";

    let validation, result;

    if (type === "laptop") {
      validation = validate(laptopSchema, body);
      if (!validation.success) {
        return errorResponse("Validation failed", 400, validation.errors);
      }
      result = await LaptopService.create(validation.data);
    } else if (type === "accessory") {
      validation = validate(accessorySchema, body);
      if (!validation.success) {
        return errorResponse("Validation failed", 400, validation.errors);
      }
      result = await AccessoryService.create(validation.data);
    } else if (type === "category") {
      validation = validate(categorySchema, body);
      if (!validation.success) {
        return errorResponse("Validation failed", 400, validation.errors);
      }
      result = await CategoryService.create(validation.data.name);
    } else {
      return errorResponse("Invalid product type", 400);
    }

    if (result.error) {
      return errorResponse(result.error, 500);
    }

    return successResponse(result.data, "Product created successfully");
  } catch (error) {
    console.error("Create product error:", error);
    return errorResponse("Internal server error", 500);
  }
}
