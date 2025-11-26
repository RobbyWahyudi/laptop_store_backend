// API Response helpers
export function successResponse(data, message = "Success") {
  return Response.json(
    {
      success: true,
      message,
      data,
    },
    { status: 200 }
  );
}

export function errorResponse(message, status = 400, errors = null) {
  return Response.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

export function createdResponse(data, message = "Created successfully") {
  return Response.json(
    {
      success: true,
      message,
      data,
    },
    { status: 201 }
  );
}

// Pagination helper
export function paginate(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return { limit, offset };
}

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

// Generate unique transaction ID
export function generateTransactionId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TRX-${timestamp}-${random}`;
}

// Calculate discount
export function calculateDiscount(price, discountPercent) {
  return price - (price * discountPercent) / 100;
}

// Parse JSON safely
export function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

// Get request body
export async function getRequestBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Get query params
export function getQueryParams(request) {
  const url = new URL(request.url);
  return Object.fromEntries(url.searchParams);
}
