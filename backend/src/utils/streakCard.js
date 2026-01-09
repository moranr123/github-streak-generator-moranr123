// /src/utils/streakCard.js
import { createCanvas, loadImage } from "canvas";
import { logger } from "../middleware/logger.js";
import { isLightBackground } from "./colorUtils.js";

export async function generateStreakCard({ 
  username, 
  current, 
  longest, 
  total, 
  avatarUrl, 
  colors = {}, 
  fontSize = 'normal', 
  hideAvatar = false,
  cardWidth = 600,
  cardHeight = 200,
  currentRange = null,
  longestRange = null,
  firstContribution = null,
  lastContribution = null,
  displaySections = { total: true, current: true, longest: true }
}) {
  // Default colors - dark purple theme
  const defaultColors = {
    background: "#1e1b4b", // Dark purple
    text: "#ffffff",
    dateText: "#ec4899", // Magenta
    currentStreak: "#f97316", // Orange
    longestStreak: "#ffffff",
    totalCommits: "#ffffff",
    divider: "#ffffff"
  };
  
  // Merge with custom colors
  const cardColors = { ...defaultColors, ...colors };
  
  // Ensure text is visible on light backgrounds - always override for light themes
  const bgColor = cardColors.background || defaultColors.background;
  const isLightBg = isLightBackground(bgColor);
  
  if (isLightBg) {
    // Always override text colors for light backgrounds to ensure visibility
    // Force dark colors for all text elements on light backgrounds - use direct assignment
    cardColors.text = '#24292e';
    cardColors.longestStreak = '#24292e';
    cardColors.totalCommits = '#24292e';
    cardColors.dateText = '#586069';
    cardColors.currentStreak = '#f97316';
    cardColors.divider = '#e1e4e8';
  }
  
  // Use provided width and height, with validation
  const width = Math.max(400, Math.min(2000, Math.round(cardWidth)));
  const height = Math.max(200, Math.min(1200, Math.round(cardHeight)));
  
  // Use 2x pixel ratio for crisp rendering
  const pixelRatio = 2;
  const canvas = createCanvas(width * pixelRatio, height * pixelRatio);
  const ctx = canvas.getContext("2d");
  
  // Scale context to match pixel ratio
  ctx.scale(pixelRatio, pixelRatio);
  
  // Enable high-quality image smoothing for crisp rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  const widthMultiplier = width / 800; // Multiplier for horizontal scaling
  const heightMultiplier = height / 400; // Multiplier for vertical scaling
  const sizeMultiplier = Math.min(widthMultiplier, heightMultiplier); // Use smaller for proportional scaling

  // Dark purple background
  ctx.fillStyle = cardColors.background;
  ctx.fillRect(0, 0, width, height);
  
  // Rounded corners effect (simulated with border)
  ctx.strokeStyle = cardColors.background;
  ctx.lineWidth = 0;
  ctx.fillRect(0, 0, width, height);

  // Calculate font sizes based on fontSize parameter and card size
  const fontSizeMultiplier = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.15 : 1.0;
  const combinedMultiplier = fontSizeMultiplier * sizeMultiplier;
  
  logger.info({
    fontSize,
    fontSizeMultiplier,
    sizeMultiplier,
    combinedMultiplier,
    cardWidth: width,
    cardHeight: height,
    isLightBg,
    cardColors: {
      background: cardColors.background,
      totalCommits: cardColors.totalCommits,
      longestStreak: cardColors.longestStreak,
      text: cardColors.text
    }
  }, 'Card generation started');
  
  // Use width multiplier for horizontal elements, height multiplier for vertical elements
  const hScale = widthMultiplier; // Horizontal scaling
  const vScale = heightMultiplier; // Vertical scaling

  // Load avatar with border (only if not hidden)
  if (avatarUrl && !hideAvatar) {
    try {
      const avatar = await loadImage(avatarUrl);
      // Draw avatar with circular border at top center
      const avatarX = width / 2;
      const avatarY = 50 * vScale;
      const avatarRadius = 35 * sizeMultiplier;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
      ctx.restore();
      
      // Avatar border
      ctx.strokeStyle = cardColors.text;
      ctx.lineWidth = 2 * sizeMultiplier;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.stroke();
    } catch (err) {
      // Silently fail avatar loading - card will still work without avatar
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to load avatar:", err.message);
      }
    }
  }

  // Username below avatar (only if avatar is not hidden)
  if (!hideAvatar) {
    ctx.fillStyle = cardColors.text;
    const usernameFontSize = Math.round(24 * combinedMultiplier);
    ctx.font = `bold ${usernameFontSize}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(username, width / 2, 95 * vScale);
  }
  const largeNumberSize = Math.round(64 * combinedMultiplier);
  const labelSize = Math.round(16 * combinedMultiplier);
  const dateSize = Math.round(14 * combinedMultiplier);
  const circleNumberSize = Math.round(48 * combinedMultiplier);

  // Helper function to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00Z');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00Z');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
  };

  // Determine which sections to display
  const showTotal = displaySections.total !== false;
  const showCurrent = displaySections.current !== false;
  const showLongest = displaySections.longest !== false;
  
  const sectionsToShow = [showTotal, showCurrent, showLongest].filter(Boolean).length;
  const sectionCount = sectionsToShow || 1; // At least 1 section
  
  // Stats container - centered vertically (below username/avatar)
  const statsY = (hideAvatar ? 80 : 140) * vScale;
  const statsHeight = height - statsY - 40 * vScale;
  const sectionWidth = (width - 120 * hScale) / sectionCount; // Dynamic section width based on count
  const sectionPadding = 40 * hScale;
  const sectionCenterY = statsY + statsHeight / 2;
  
  // Calculate starting X position to center sections
  const totalWidth = (sectionWidth * sectionCount) + (sectionPadding * (sectionCount - 1));
  const startX = (width - totalWidth) / 2;

  // Track current section position
  let currentSectionIndex = 0;
  
  // Left Section: Total Contributions
  if (showTotal) {
    const leftX = startX + (currentSectionIndex * (sectionWidth + sectionPadding));
    const leftCenterX = leftX + sectionWidth / 2;
    
    // Calculate vertical spacing for left section
    const leftNumberY = sectionCenterY - 50 * vScale;
    const leftLabelY = sectionCenterY + 10 * vScale;
    const leftDateY = sectionCenterY + 35 * vScale;
    
    // Total number
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Force color to be dark for light backgrounds
    const totalColor = isLightBg ? '#24292e' : cardColors.totalCommits;
    ctx.fillStyle = totalColor;
    ctx.font = `bold ${largeNumberSize}px 'Segoe UI', Arial, sans-serif`;
    const totalText = total.toLocaleString();
    
    logger.info({
      fillStyle: ctx.fillStyle,
      font: ctx.font,
      largeNumberSize,
      text: totalText,
      position: { x: leftCenterX, y: leftNumberY },
      cardColorTotal: cardColors.totalCommits,
      isLightBg,
      forcedColor: totalColor
    }, 'Drawing total contributions');
    
    ctx.fillText(totalText, leftCenterX, leftNumberY);
    
    // Label
    ctx.fillStyle = cardColors.text;
    ctx.font = `${labelSize}px 'Segoe UI', Arial, sans-serif`;
    const totalLabel = "Total Contributions";
    ctx.textBaseline = 'top';
    ctx.fillText(totalLabel, leftCenterX, leftLabelY);
    
    // Date range
    if (firstContribution && lastContribution) {
      ctx.fillStyle = cardColors.dateText;
      ctx.font = `${dateSize}px 'Segoe UI', Arial, sans-serif`;
      const dateRange = `${formatDate(firstContribution)} - Present`;
      ctx.fillText(dateRange, leftCenterX, leftDateY);
    }
    
    currentSectionIndex++;
  }

  // Middle Section: Current Streak (with circle)
  if (showCurrent) {
    const middleX = startX + (currentSectionIndex * (sectionWidth + sectionPadding));
    const middleCenterX = middleX + sectionWidth / 2;
    const circleY = sectionCenterY;
    const circleRadius = 50 * sizeMultiplier;
    
    // Draw circle outline
    ctx.strokeStyle = cardColors.text;
    ctx.lineWidth = 3 * sizeMultiplier;
    ctx.beginPath();
    ctx.arc(middleCenterX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Flame icon above circle - draw using paths instead of emoji
    const flameSize = Math.round(32 * combinedMultiplier);
    const flameY = circleY - circleRadius - 15 * vScale;
    drawFireIcon(ctx, middleCenterX, flameY, flameSize, cardColors.currentStreak);
    
    // Number inside circle
    ctx.fillStyle = cardColors.currentStreak;
    ctx.font = `bold ${circleNumberSize}px 'Segoe UI', Arial, sans-serif`;
    const currentText = `${current}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(currentText, middleCenterX, circleY);
    
    // Label below circle
    ctx.fillStyle = cardColors.currentStreak;
    ctx.font = `${labelSize}px 'Segoe UI', Arial, sans-serif`;
    const currentLabel = "Current Streak";
    ctx.textBaseline = 'top';
    ctx.fillText(currentLabel, middleCenterX, circleY + circleRadius + 20 * vScale);
    
    // Date range
    if (currentRange && currentRange.start && currentRange.end) {
      ctx.fillStyle = cardColors.dateText;
      ctx.font = `${dateSize}px 'Segoe UI', Arial, sans-serif`;
      const dateRange = `${formatDateShort(currentRange.start)} - ${formatDateShort(currentRange.end)}`;
      ctx.fillText(dateRange, middleCenterX, circleY + circleRadius + 40 * vScale);
    }
    
    currentSectionIndex++;
  }

  // Right Section: Longest Streak
  if (showLongest) {
    const rightX = startX + (currentSectionIndex * (sectionWidth + sectionPadding));
    const rightCenterX = rightX + sectionWidth / 2;
    
    // Calculate vertical spacing for right section (same as left)
    const rightNumberY = sectionCenterY - 50 * vScale;
    const rightLabelY = sectionCenterY + 10 * vScale;
    const rightDateY = sectionCenterY + 35 * vScale;
    
    // Longest number
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Force color to be dark for light backgrounds
    const longestColor = isLightBg ? '#24292e' : cardColors.longestStreak;
    ctx.fillStyle = longestColor;
    ctx.font = `bold ${largeNumberSize}px 'Segoe UI', Arial, sans-serif`;
    const longestText = `${longest}`;
    
    logger.info({
      fillStyle: ctx.fillStyle,
      font: ctx.font,
      largeNumberSize,
      text: longestText,
      position: { x: rightCenterX, y: rightNumberY },
      cardColorLongest: cardColors.longestStreak,
      isLightBg,
      forcedColor: longestColor
    }, 'Drawing longest streak');
    
    ctx.fillText(longestText, rightCenterX, rightNumberY);
    
    // Label
    ctx.fillStyle = cardColors.text;
    ctx.font = `${labelSize}px 'Segoe UI', Arial, sans-serif`;
    const longestLabel = "Longest Streak";
    ctx.textBaseline = 'top';
    ctx.fillText(longestLabel, rightCenterX, rightLabelY);
    
    // Date range
    if (longestRange && longestRange.start && longestRange.end) {
      ctx.fillStyle = cardColors.dateText;
      ctx.font = `${dateSize}px 'Segoe UI', Arial, sans-serif`;
      const dateRange = `${formatDateShort(longestRange.start)} - ${formatDateShort(longestRange.end)}`;
      ctx.fillText(dateRange, rightCenterX, rightDateY);
    }
    
    currentSectionIndex++;
  }
  
  // Reset text alignment
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Vertical divider lines (only between sections)
  if (sectionsToShow > 1) {
    ctx.strokeStyle = cardColors.divider;
    ctx.lineWidth = 1 * sizeMultiplier;
    
    let dividerIndex = 0;
    if (showTotal && showCurrent) {
      const dividerX = startX + sectionWidth + (dividerIndex * (sectionWidth + sectionPadding));
      ctx.beginPath();
      ctx.moveTo(dividerX, statsY + 20 * vScale);
      ctx.lineTo(dividerX, statsY + statsHeight - 20 * vScale);
      ctx.stroke();
      dividerIndex++;
    }
    if ((showTotal && showLongest) || (showCurrent && showLongest)) {
      const dividerX = startX + (sectionWidth * (dividerIndex + 1)) + (dividerIndex * sectionPadding);
      ctx.beginPath();
      ctx.moveTo(dividerX, statsY + 20 * vScale);
      ctx.lineTo(dividerX, statsY + statsHeight - 20 * vScale);
      ctx.stroke();
    }
  }

  // Scale down the canvas to the original size for output
  const outputCanvas = createCanvas(width, height);
  const outputCtx = outputCanvas.getContext("2d");
  outputCtx.imageSmoothingEnabled = true;
  outputCtx.imageSmoothingQuality = 'high';
  outputCtx.drawImage(canvas, 0, 0, width, height);
  
  return outputCanvas.toBuffer("image/png");
}

/**
 * Draw a fire/flame icon using canvas paths
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X position
 * @param {number} y - Center Y position
 * @param {number} size - Size of the icon
 * @param {string} color - Color of the flame
 */
function drawFireIcon(ctx, x, y, size, color) {
  const scale = size / 32; // Base size is 32
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Create gradient for fire effect
  const gradient = ctx.createLinearGradient(0, -16, 0, 16);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, '#ff6b00'); // Darker orange at bottom
  
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#ff4500';
  ctx.lineWidth = 0.5; // Thin outline for flame
  
  // Draw flame shape using bezier curves
  ctx.beginPath();
  // Left flame
  ctx.moveTo(-8, 12);
  ctx.bezierCurveTo(-10, 8, -12, 0, -8, -8);
  ctx.bezierCurveTo(-6, -12, -4, -14, 0, -16);
  // Right flame
  ctx.bezierCurveTo(4, -14, 6, -12, 8, -8);
  ctx.bezierCurveTo(12, 0, 10, 8, 8, 12);
  // Bottom
  ctx.lineTo(-8, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Inner flame highlight
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath();
  ctx.moveTo(-4, 8);
  ctx.bezierCurveTo(-5, 4, -6, -2, -4, -6);
  ctx.bezierCurveTo(-3, -8, -2, -10, 0, -12);
  ctx.bezierCurveTo(2, -10, 3, -8, 4, -6);
  ctx.bezierCurveTo(6, -2, 5, 4, 4, 8);
  ctx.lineTo(-4, 8);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}
