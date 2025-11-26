import { supabaseAdmin } from "@/lib/supabase";
import { LaptopService } from "./product.service";

export const AIService = {
  // AI Laptop Recommendation based on user needs
  async recommendLaptop(criteria) {
    const { need, min_budget, max_budget, min_ram, brand_preference } =
      criteria;

    // Build query based on criteria
    let query = supabaseAdmin
      .from("laptops")
      .select("*, laptop_categories(name)")
      .gt("stock", 0); // Only in-stock laptops

    // Budget filter
    if (min_budget) {
      query = query.gte("price", min_budget);
    }
    if (max_budget) {
      query = query.lte("price", max_budget);
    }

    // RAM filter
    if (min_ram) {
      query = query.gte("ram", min_ram);
    }

    // Brand preference
    if (brand_preference) {
      query = query.eq("brand", brand_preference);
    }

    const { data: laptops, error } = await query;

    if (error || !laptops || laptops.length === 0) {
      return { data: [], error: error?.message || "No laptops found" };
    }

    // Score laptops based on need
    const scoredLaptops = laptops.map((laptop) => {
      let score = 0;

      // Scoring based on need
      if (need === "gaming") {
        // Gaming needs: High GPU, RAM, and good display
        if (laptop.gpu && laptop.gpu.toLowerCase().includes("rtx")) score += 40;
        else if (laptop.gpu && laptop.gpu.toLowerCase().includes("gtx"))
          score += 30;
        else if (laptop.gpu && laptop.gpu.toLowerCase().includes("nvidia"))
          score += 20;

        if (laptop.ram >= 16) score += 30;
        else if (laptop.ram >= 8) score += 15;

        if (laptop.display && laptop.display.includes("144Hz")) score += 20;
        else if (laptop.display && laptop.display.includes("120Hz"))
          score += 15;

        if (
          laptop.cpu &&
          (laptop.cpu.includes("i7") || laptop.cpu.includes("Ryzen 7"))
        )
          score += 10;
      } else if (need === "editing") {
        // Editing needs: High CPU, RAM, and storage
        if (
          laptop.cpu &&
          (laptop.cpu.includes("i9") || laptop.cpu.includes("Ryzen 9"))
        )
          score += 35;
        else if (
          laptop.cpu &&
          (laptop.cpu.includes("i7") || laptop.cpu.includes("Ryzen 7"))
        )
          score += 25;

        if (laptop.ram >= 32) score += 35;
        else if (laptop.ram >= 16) score += 20;

        if (laptop.storage && laptop.storage.includes("1TB")) score += 15;
        else if (laptop.storage && laptop.storage.includes("512GB"))
          score += 10;

        if (laptop.gpu && laptop.gpu.toLowerCase().includes("rtx")) score += 15;
      } else if (need === "programming") {
        // Programming needs: Good CPU, RAM, and battery
        if (
          laptop.cpu &&
          (laptop.cpu.includes("i7") || laptop.cpu.includes("Ryzen 7"))
        )
          score += 30;
        else if (
          laptop.cpu &&
          (laptop.cpu.includes("i5") || laptop.cpu.includes("Ryzen 5"))
        )
          score += 20;

        if (laptop.ram >= 16) score += 30;
        else if (laptop.ram >= 8) score += 15;

        if (laptop.storage && laptop.storage.includes("SSD")) score += 20;

        if (laptop.weight && laptop.weight < 2.0) score += 20; // Portable
      } else if (need === "office" || need === "bisnis") {
        // Office needs: Lightweight, good battery, decent performance
        if (laptop.weight && laptop.weight < 1.5) score += 30;
        else if (laptop.weight && laptop.weight < 2.0) score += 20;

        if (
          laptop.cpu &&
          (laptop.cpu.includes("i5") || laptop.cpu.includes("Ryzen 5"))
        )
          score += 25;

        if (laptop.ram >= 8) score += 20;

        if (laptop.storage && laptop.storage.includes("SSD")) score += 15;

        // Price efficiency for office work
        if (laptop.price < 10000000) score += 10;
      }

      // Budget match bonus
      if (max_budget && laptop.price <= max_budget * 0.9) {
        score += 10; // Bonus for being under budget
      }

      return {
        ...laptop,
        recommendation_score: score,
        match_reason: this.getMatchReason(laptop, need),
      };
    });

    // Sort by score and return top recommendations
    const topRecommendations = scoredLaptops
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, 5);

    // Log AI recommendation
    await this.logRecommendation(criteria, topRecommendations);

    return { data: topRecommendations, error: null };
  },

  getMatchReason(laptop, need) {
    const reasons = [];

    if (need === "gaming") {
      if (laptop.gpu && laptop.gpu.toLowerCase().includes("rtx")) {
        reasons.push("GPU kuat untuk gaming");
      }
      if (laptop.ram >= 16) {
        reasons.push("RAM cukup untuk game modern");
      }
      if (laptop.display && laptop.display.includes("Hz")) {
        reasons.push("Refresh rate tinggi");
      }
    } else if (need === "editing") {
      if (
        laptop.cpu &&
        (laptop.cpu.includes("i7") || laptop.cpu.includes("i9"))
      ) {
        reasons.push("Prosesor powerful untuk rendering");
      }
      if (laptop.ram >= 16) {
        reasons.push("RAM besar untuk multitasking");
      }
    } else if (need === "programming") {
      if (laptop.ram >= 16) {
        reasons.push("RAM ideal untuk development");
      }
      if (laptop.weight < 2) {
        reasons.push("Ringan dan portable");
      }
    } else if (need === "office" || need === "bisnis") {
      if (laptop.weight < 2) {
        reasons.push("Sangat portable untuk mobilitas");
      }
      reasons.push("Cocok untuk produktivitas harian");
    }

    return reasons.join(", ");
  },

  // Accessory cross-sell recommendations
  async recommendAccessories(laptopId, transactionHistory = []) {
    // Get laptop details
    const { data: laptop } = await LaptopService.getById(laptopId);
    if (!laptop) {
      return { data: [], error: "Laptop not found" };
    }

    const recommendations = [];

    // Rule-based recommendations based on laptop category/purpose
    const category = laptop.laptop_categories?.name?.toLowerCase() || "";

    // Get all accessories
    const { data: allAccessories } = await supabaseAdmin
      .from("accessories")
      .select("*")
      .gt("stock", 0);

    if (!allAccessories) {
      return { data: [], error: null };
    }

    // Gaming laptop → cooling pad, gaming mouse
    if (category.includes("gaming") || laptop.gpu?.includes("RTX")) {
      const coolingPad = allAccessories.find(
        (a) =>
          a.category.toLowerCase().includes("cooling") ||
          a.name.toLowerCase().includes("cooling pad")
      );
      if (coolingPad) {
        recommendations.push({
          ...coolingPad,
          reason:
            "Cooling pad membantu menjaga suhu laptop gaming tetap optimal",
        });
      }

      const gamingMouse = allAccessories.find(
        (a) =>
          a.category.toLowerCase().includes("mouse") &&
          a.name.toLowerCase().includes("gaming")
      );
      if (gamingMouse) {
        recommendations.push({
          ...gamingMouse,
          reason: "Mouse gaming untuk pengalaman gaming terbaik",
        });
      }
    }

    // Office/Student → laptop bag, mouse
    if (
      category.includes("office") ||
      category.includes("bisnis") ||
      laptop.weight < 2
    ) {
      const laptopBag = allAccessories.find(
        (a) =>
          a.category.toLowerCase().includes("tas") ||
          a.category.toLowerCase().includes("bag")
      );
      if (laptopBag) {
        recommendations.push({
          ...laptopBag,
          reason: "Tas laptop untuk melindungi dan mobilitas",
        });
      }

      const mouse = allAccessories.find(
        (a) =>
          a.category.toLowerCase().includes("mouse") &&
          !a.name.toLowerCase().includes("gaming")
      );
      if (mouse) {
        recommendations.push({
          ...mouse,
          reason: "Mouse wireless untuk produktivitas",
        });
      }
    }

    // Editing laptop → external SSD
    if (category.includes("editing") || laptop.ram >= 16) {
      const externalSSD = allAccessories.find(
        (a) =>
          a.name.toLowerCase().includes("ssd") ||
          a.name.toLowerCase().includes("storage")
      );
      if (externalSSD) {
        recommendations.push({
          ...externalSSD,
          reason: "Storage eksternal untuk backup project",
        });
      }
    }

    // Collaborative filtering from transaction history
    if (transactionHistory.length > 0) {
      // Find frequently bought together items
      const frequentAccessories = await this.getFrequentlyBoughtTogether(
        laptopId
      );
      frequentAccessories.forEach((acc) => {
        if (!recommendations.find((r) => r.id === acc.id)) {
          recommendations.push({
            ...acc,
            reason: "Sering dibeli bersamaan dengan laptop ini",
          });
        }
      });
    }

    return { data: recommendations.slice(0, 4), error: null };
  },

  async getFrequentlyBoughtTogether(laptopId) {
    // Get transactions that include this laptop
    const { data: transactions } = await supabaseAdmin
      .from("transaction_items")
      .select(
        `
        transaction_id,
        transactions!inner(id)
      `
      )
      .eq("product_type", "laptop")
      .eq("product_id", laptopId);

    if (!transactions || transactions.length === 0) {
      return [];
    }

    const transactionIds = transactions.map((t) => t.transaction_id);

    // Get accessories bought in those transactions
    const { data: accessories } = await supabaseAdmin
      .from("transaction_items")
      .select("product_id")
      .eq("product_type", "accessory")
      .in("transaction_id", transactionIds);

    if (!accessories || accessories.length === 0) {
      return [];
    }

    // Count frequency
    const frequency = {};
    accessories.forEach((acc) => {
      frequency[acc.product_id] = (frequency[acc.product_id] || 0) + 1;
    });

    // Get top 3 most frequent
    const topAccessoryIds = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => parseInt(id));

    // Fetch accessory details
    const { data: accessoryDetails } = await supabaseAdmin
      .from("accessories")
      .select("*")
      .in("id", topAccessoryIds)
      .gt("stock", 0);

    return accessoryDetails || [];
  },

  async logRecommendation(userInput, recommended) {
    await supabaseAdmin.from("ai_logs").insert([
      {
        user_input: userInput,
        recommended: recommended.map((r) => ({
          id: r.id,
          name: r.name,
          score: r.recommendation_score,
        })),
      },
    ]);
  },
};
