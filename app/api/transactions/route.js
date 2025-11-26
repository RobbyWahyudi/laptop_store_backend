import { TransactionService } from "@/services/transaction.service";
import { authenticate } from "@/lib/auth";
import { validate, transactionSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  getRequestBody,
  getQueryParams,
} from "@/lib/utils";

// GET all transactions
export async function GET(request) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    const params = getQueryParams(request);

    // Cashiers can only see their own transactions unless they're admin/owner
    if (user.role === "kasir") {
      params.cashier_id = user.id;
    }

    const { data, error } = await TransactionService.getAll(params);

    if (error) {
      return errorResponse(error, 500);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Get transactions error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST create new transaction
export async function POST(request) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    // Only admin and kasir can create transactions
    if (user.role !== "admin" && user.role !== "kasir") {
      return errorResponse("Insufficient permissions", 403);
    }

    const body = await getRequestBody(request);

    // Validate transaction data
    const validation = validate(transactionSchema, body);
    if (!validation.success) {
      return errorResponse("Validation failed", 400, validation.errors);
    }

    const { data, error } = await TransactionService.create(
      validation.data,
      user.id
    );

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse(data, "Transaction created successfully");
  } catch (error) {
    console.error("Create transaction error:", error);
    return errorResponse("Internal server error", 500);
  }
}
