/**
 * 火山引擎即梦AI API 服务（通过 Cloudflare Workers 代理）
 */

import { CoupletData } from "../types";

// API URL can be configured in Cloudflare Pages env: VITE_API_BASE_URL
const fallbackOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://hunchun.pages.dev";
const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL =
  envApiBaseUrl && !envApiBaseUrl.includes("workers.dev")
    ? envApiBaseUrl
    : fallbackOrigin;

/**
 * 调用 Workers API 生成对联图片
 */
export const generateCoupletImage = async (
  couplet: CoupletData
): Promise<string> => {
  try {
    console.log('Calling Workers API to generate couplet image...');

    const response = await fetch(`${API_BASE_URL}/api/generate-couplet-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        upper: couplet.upper,
        lower: couplet.lower,
        horizontal: couplet.horizontal,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.imageUrl) {
      throw new Error("未获取到图片 URL");
    }

    console.log('Couplet image generated successfully');
    return result.imageUrl;
  } catch (error) {
    console.error("调用图片生成服务时出错:", error);
    throw error;
  }
};
