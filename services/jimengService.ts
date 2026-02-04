/**
 * 火山引擎即梦AI API 服务（通过本地后端代理）
 */

import { CoupletData } from "../types";

const BACKEND_URL = "http://localhost:3001";

/**
 * 调用本地后端服务生成对联图片
 */
export const generateCoupletImage = async (
  couplet: CoupletData
): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-couplet-image`, {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.imageUrl) {
      throw new Error("未获取到图片 URL");
    }

    return result.imageUrl;
  } catch (error) {
    console.error("调用图片生成服务时出错:", error);
    throw error;
  }
};
