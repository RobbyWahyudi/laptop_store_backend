import { TransactionService } from "@/services/transaction.service";
import { authenticate } from "@/lib/auth";
import { successResponse, errorResponse, getQueryParams } from "@/lib/utils";

// GET transaction by ID
export async function GET(request, { params }) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    const { id } = params;
    const { data, error } = await TransactionService.getById(parseInt(id));

    if (error) {
      return errorResponse(error, 404);
    }

    // Cashiers can only see their own transactions
    if (user.role === "kasir" && data.cashier_id !== user.id) {
      return errorResponse("Access denied", 403);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Get transaction error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE void transaction
export async function DELETE(request, { params }) {
  try {
    const { user, error: authError } = await authenticate(request);
    if (authError) {
      return errorResponse(authError, 401);
    }

    // Only admin can void transactions
    if (user.role !== "admin") {
      return errorResponse("Insufficient permissions", 403);
    }

    const { id } = params;
    const queryParams = getQueryParams(request);
    const reason = queryParams.reason || "Voided by admin";

    const { data, error } = await TransactionService.void(parseInt(id), reason);

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse(data, "Transaction voided successfully");
  } catch (error) {
    console.error("Void transaction error:", error);
    return errorResponse("Internal server error", 500);
  }
}
