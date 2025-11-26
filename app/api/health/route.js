import { successResponse } from "@/lib/utils";

export async function GET(request) {
  return successResponse(
    {
      status: "OK",
      message: "Laptop Store Backend API is running",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: "/api/auth/*",
        products: "/api/products/*",
        transactions: "/api/transactions/*",
        ai: "/api/ai/*",
        analytics: "/api/analytics/*",
      },
    },
    "API Health Check OK"
  );
}
