import { LaptopService, AccessoryService } from "@/services/product.service";
import { successResponse, errorResponse } from "@/lib/utils";

// GET low stock products
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const threshold = parseInt(url.searchParams.get("threshold")) || 10;
    const type = url.searchParams.get("type") || "all";

    let laptops = [];
    let accessories = [];

    if (type === "all" || type === "laptop") {
      const laptopResult = await LaptopService.getLowStock(threshold);
      if (!laptopResult.error) {
        laptops = laptopResult.data;
      }
    }

    if (type === "all" || type === "accessory") {
      const accessoryResult = await AccessoryService.getLowStock(threshold);
      if (!accessoryResult.error) {
        accessories = accessoryResult.data;
      }
    }

    return successResponse({
      laptops,
      accessories,
      total: laptops.length + accessories.length,
    });
  } catch (error) {
    console.error("Get low stock error:", error);
    return errorResponse("Internal server error", 500);
  }
}
