/**
 * Canvas Service for rendering Chinese Spring Festival Couplets
 * Creates high-quality images with traditional brush calligraphy styling
 */

import { CoupletData } from "../types";

// Canvas dimensions
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 1600;

// Scroll dimensions
const SCROLL_WIDTH = 180;
const SCROLL_HEIGHT = 750;
const HORIZONTAL_SCROLL_WIDTH = 550;
const HORIZONTAL_SCROLL_HEIGHT = 130;

// Colors - traditional Chinese palette
const COLORS = {
  paperRed: "#B8333A",
  paperRedLight: "#D44A4A",
  paperGold: "#FFD700",
  textBlack: "#1A1A1A",
  textGold: "#C9A227",
  textGoldLight: "#E8D48A",
  shadow: "rgba(0, 0, 0, 0.4)",
  borderGold: "#D4AF37",
  borderGoldDark: "#B8860B",
};

/**
 * Draw realistic paper texture with fiber effects
 */
function drawPaperTexture(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  ctx.save();

  // Base texture with subtle noise
  for (let i = 0; i < width * height * 0.05; i++) {
    const tx = x + Math.random() * width;
    const ty = y + Math.random() * height;
    const size = Math.random() * 1.5 + 0.5;
    const alpha = Math.random() * 0.08;

    ctx.beginPath();
    ctx.arc(tx, ty, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }

  // Add subtle fiber streaks
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    const startX = x + Math.random() * width;
    const startY = y + Math.random() * height;
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + (Math.random() - 0.5) * 50,
      startY + Math.random() * 30,
      startX + (Math.random() - 0.5) * 50,
      startY + Math.random() * 30 + 30,
      startX + (Math.random() - 0.5) * 20,
      startY + Math.random() * 50 + 50
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw gold flecks and speckles
 */
function drawGoldFlecks(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  ctx.save();
  for (let i = 0; i < 50; i++) {
    const fx = x + Math.random() * width;
    const fy = y + Math.random() * height;
    const size = Math.random() * 2.5 + 0.8;
    const alpha = Math.random() * 0.5 + 0.2;

    ctx.beginPath();
    ctx.arc(fx, fy, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(218, 165, 32, ${alpha})`;
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draw traditional Chinese cloud pattern at corners
 */
function drawCloudPattern(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number
): void {
  ctx.save();
  ctx.strokeStyle = COLORS.borderGold;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  // Simple cloud spiral pattern
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const radius = size * (0.3 + i * 0.2);
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 1.5);
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw decorative border pattern
 */
function drawBorderPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.strokeStyle = COLORS.borderGold;
  ctx.lineWidth = 2;

  // Inner border
  const inset = 8;
  ctx.strokeRect(x + inset, y + inset, width - inset * 2, height - inset * 2);

  // Corner decorations
  const cornerSize = 15;
  const corners = [
    { cx: x + inset + cornerSize, cy: y + inset + cornerSize },
    { cx: x + width - inset - cornerSize, cy: y + inset + cornerSize },
    { cx: x + inset + cornerSize, cy: y + height - inset - cornerSize },
    { cx: x + width - inset - cornerSize, cy: y + height - inset - cornerSize },
  ];

  corners.forEach((corner) => {
    drawCloudPattern(ctx, corner.cx, corner.cy, cornerSize);
  });

  ctx.restore();
}

/**
 * Draw brush-style character with calligraphy effect
 */
function drawBrushCharacter(
  ctx: CanvasRenderingContext2D,
  char: string,
  x: number,
  y: number,
  fontSize: number
): void {
  ctx.save();

  // Multiple layers for brush stroke effect
  const layers = [
    { offsetX: 0, offsetY: 0, blur: 0, alpha: 1, color: COLORS.textGold },
    { offsetX: 1, offsetY: 1, blur: 2, alpha: 0.3, color: COLORS.textBlack },
    { offsetX: -0.5, offsetY: -0.5, blur: 1, alpha: 0.2, color: COLORS.textGoldLight },
  ];

  layers.forEach((layer) => {
    ctx.font = `bold ${fontSize}px "KaiTi", "STKaiti", "AR PL UKai CN", "BiauKai", "Noto Serif SC", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (layer.blur > 0) {
      ctx.filter = `blur(${layer.blur}px)`;
    } else {
      ctx.filter = "none";
    }

    ctx.fillStyle = layer.color;
    ctx.globalAlpha = layer.alpha;
    ctx.fillText(char, x + layer.offsetX, y + layer.offsetY);
  });

  ctx.restore();
}

/**
 * Draw a single vertical scroll with traditional styling
 */
function drawVerticalScroll(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string
): void {
  // Draw shadow
  ctx.fillStyle = COLORS.shadow;
  ctx.fillRect(x + 6, y + 6, SCROLL_WIDTH, SCROLL_HEIGHT);

  // Draw scroll background with gradient
  const gradient = ctx.createLinearGradient(x, y, x + SCROLL_WIDTH, y);
  gradient.addColorStop(0, COLORS.paperRed);
  gradient.addColorStop(0.3, COLORS.paperRedLight);
  gradient.addColorStop(0.7, COLORS.paperRedLight);
  gradient.addColorStop(1, COLORS.paperRed);

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, SCROLL_WIDTH, SCROLL_HEIGHT);

  // Draw decorative border
  drawBorderPattern(ctx, x, y, SCROLL_WIDTH, SCROLL_HEIGHT);

  // Add paper texture
  drawPaperTexture(ctx, x, y, SCROLL_WIDTH, SCROLL_HEIGHT);

  // Add gold flecks
  drawGoldFlecks(ctx, x, y, SCROLL_WIDTH, SCROLL_HEIGHT);

  // Draw text vertically (traditional Chinese writing: right to left, top to bottom)
  const chars = text.split("").reverse();
  const padding = 40;
  const availableHeight = SCROLL_HEIGHT - padding * 2;
  const fontSize = Math.min(60, availableHeight / chars.length);

  ctx.save();
  const centerX = x + SCROLL_WIDTH / 2;
  const startY = y + padding + fontSize / 2;

  chars.forEach((char, index) => {
    const charY = startY + index * fontSize;
    drawBrushCharacter(ctx, char, centerX, charY, fontSize);
  });

  ctx.restore();

  // Add seal/stamp at bottom
  drawSeal(ctx, x + SCROLL_WIDTH - 25, y + SCROLL_HEIGHT - 25);
}

/**
 * Draw horizontal scroll with traditional styling
 */
function drawHorizontalScroll(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string
): void {
  // Shadow
  ctx.fillStyle = COLORS.shadow;
  ctx.fillRect(x + 6, y + 6, HORIZONTAL_SCROLL_WIDTH, HORIZONTAL_SCROLL_HEIGHT);

  // Background gradient
  const gradient = ctx.createLinearGradient(x, y, x, y + HORIZONTAL_SCROLL_HEIGHT);
  gradient.addColorStop(0, COLORS.paperRed);
  gradient.addColorStop(0.5, COLORS.paperRedLight);
  gradient.addColorStop(1, COLORS.paperRed);

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, HORIZONTAL_SCROLL_WIDTH, HORIZONTAL_SCROLL_HEIGHT);

  // Decorative border
  drawBorderPattern(ctx, x, y, HORIZONTAL_SCROLL_WIDTH, HORIZONTAL_SCROLL_HEIGHT);

  // Texture and gold flecks
  drawPaperTexture(ctx, x, y, HORIZONTAL_SCROLL_WIDTH, HORIZONTAL_SCROLL_HEIGHT);
  drawGoldFlecks(ctx, x, y, HORIZONTAL_SCROLL_WIDTH, HORIZONTAL_SCROLL_HEIGHT);

  // Draw text
  const fontSize = Math.min(55, (HORIZONTAL_SCROLL_WIDTH - 80) / text.length);
  const centerX = x + HORIZONTAL_SCROLL_WIDTH / 2;
  const centerY = y + HORIZONTAL_SCROLL_HEIGHT / 2;

  drawBrushCharacter(ctx, text, centerX, centerY, fontSize);

  // Add seals at both ends
  drawSeal(ctx, x + 25, y + HORIZONTAL_SCROLL_HEIGHT / 2);
  drawSeal(ctx, x + HORIZONTAL_SCROLL_WIDTH - 25, y + HORIZONTAL_SCROLL_HEIGHT / 2);
}

/**
 * Draw traditional red seal/stamp
 */
function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();

  const size = 18;

  // Seal background
  ctx.fillStyle = "#A81C1C";
  ctx.beginPath();
  ctx.roundRect(x - size / 2, y - size / 2, size, size, 3);
  ctx.fill();

  // Seal border
  ctx.strokeStyle = "#8B0000";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // White character (simplified "spring" or decorative mark)
  ctx.fillStyle = "#FFF8E7";
  ctx.font = "bold 12px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("春", x, y);

  ctx.restore();
}

/**
 * Draw traditional Chinese lantern
 */
function drawLantern(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Lantern tassel string
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.lineTo(0, 80);
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Tassel strands
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 3, 80);
    ctx.quadraticCurveTo(i * 5, 100, i * 4, 120);
    ctx.strokeStyle = "#C9A227";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Lantern body - gradient red
  const lanternGradient = ctx.createRadialGradient(-5, -5, 5, 0, 0, 40);
  lanternGradient.addColorStop(0, "#FF6B6B");
  lanternGradient.addColorStop(0.7, "#E63950");
  lanternGradient.addColorStop(1, "#B8333A");

  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = lanternGradient;
  ctx.fill();

  // Gold rim at top
  ctx.beginPath();
  ctx.ellipse(0, -38, 15, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#D4AF37";
  ctx.fill();

  // Gold rim at bottom
  ctx.beginPath();
  ctx.ellipse(0, 38, 15, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#D4AF37";
  ctx.fill();

  // Vertical gold bands
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 12, -35);
    ctx.lineTo(i * 12, 35);
    ctx.stroke();
  }

  // "Fu" character in center
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 24px 'KaiTi', 'STKaiti', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("福", 0, 0);

  ctx.restore();
}

/**
 * Draw decorative background elements
 */
function drawBackgroundDecorations(ctx: CanvasRenderingContext2D): void {
  ctx.save();

  // Top lanterns
  drawLantern(ctx, 100, 180, 1.2);
  drawLantern(ctx, CANVAS_WIDTH - 100, 180, 1.2);

  // Bottom lanterns
  drawLantern(ctx, 150, CANVAS_HEIGHT - 150, 0.9);
  drawLantern(ctx, CANVAS_WIDTH - 150, CANVAS_HEIGHT - 150, 0.9);

  // Subtle cloud patterns in corners
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = COLORS.borderGold;

  const drawCloud = (cx: number, cy: number): void => {
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.arc(cx + 30, cy - 10, 30, 0, Math.PI * 2);
    ctx.arc(cx + 60, cy, 35, 0, Math.PI * 2);
    ctx.arc(cx + 30, cy + 15, 25, 0, Math.PI * 2);
    ctx.fill();
  };

  drawCloud(80, 300);
  drawCloud(CANVAS_WIDTH - 140, 300);
  drawCloud(80, CANVAS_HEIGHT - 300);
  drawCloud(CANVAS_WIDTH - 140, CANVAS_HEIGHT - 300);

  ctx.restore();
}

/**
 * Generate the complete couplet image with traditional styling
 */
export const generateCoupletImage = async (couplet: CoupletData): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Draw warm gradient background
      const bgGradient = ctx.createRadialGradient(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        0,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        CANVAS_WIDTH * 0.7
      );
      bgGradient.addColorStop(0, "#3D2317");
      bgGradient.addColorStop(0.5, "#2A1810");
      bgGradient.addColorStop(1, "#1A0F0A");

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Add subtle pattern overlay
      ctx.globalAlpha = 0.03;
      ctx.fillStyle = COLORS.borderGold;
      for (let i = 0; i < 150; i++) {
        const px = Math.random() * CANVAS_WIDTH;
        const py = Math.random() * CANVAS_HEIGHT;
        const size = Math.random() * 4 + 1;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw background decorations
      drawBackgroundDecorations(ctx);

      // Calculate scroll positions
      // Traditional layout: Right = Upper (上联), Left = Lower (下联)
      const rightScrollX = CANVAS_WIDTH / 2 - SCROLL_WIDTH - 40;
      const leftScrollX = CANVAS_WIDTH / 2 + 40;
      const scrollY = 280;
      const horizontalScrollX = (CANVAS_WIDTH - HORIZONTAL_SCROLL_WIDTH) / 2;
      const horizontalScrollY = 80;

      // Draw horizontal scroll (top)
      drawHorizontalScroll(ctx, horizontalScrollX, horizontalScrollY, couplet.horizontal);

      // Draw vertical scrolls
      drawVerticalScroll(ctx, rightScrollX, scrollY, couplet.upper);
      drawVerticalScroll(ctx, leftScrollX, scrollY, couplet.lower);

      // Add warm glow overlay
      ctx.save();
      ctx.globalCompositeOperation = "overlay";
      const glowGradient = ctx.createRadialGradient(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        0,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        CANVAS_WIDTH * 0.6
      );
      glowGradient.addColorStop(0, "rgba(255, 215, 0, 0.15)");
      glowGradient.addColorStop(0.5, "rgba(255, 215, 0, 0.08)");
      glowGradient.addColorStop(1, "transparent");
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();

      // Convert to base64 data URL
      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl);
    } catch (error) {
      console.error("Error generating couplet image:", error);
      reject(error);
    }
  });
};
