import { CoupletData } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://hunchun-api.abelzhou3399.workers.dev";

if (!API_BASE_URL) {
  console.error("API_BASE_URL is not set.");
}

/**
 * Generate couplet text using local backend proxy
 */
export const generateCoupletText = async (recipient: string, theme: string): Promise<CoupletData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-couplet-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient,
        theme,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const parsed = await response.json() as CoupletData;

    // Validate response structure
    if (!parsed.upper || !parsed.lower || !parsed.horizontal) {
      throw new Error("Invalid response format from API");
    }

    return parsed;
  } catch (error) {
    console.error("Error generating couplet text:", error);
    throw error;
  }
};

// Note: Image generation is now handled by canvasService.ts
// This function is kept for compatibility but is no longer used
export const generateCoupletImage = async (_couplet: CoupletData): Promise<string> => {
  throw new Error("Image generation is handled by canvasService.ts");
};
