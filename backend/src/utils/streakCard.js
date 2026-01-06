// /src/utils/streakCard.js
import { createCanvas, loadImage } from "canvas";

export async function generateStreakCard({ 
  username, 
  current, 
  longest, 
  total, 
  avatarUrl, 
  colors = {}, 
  fontSize = 'normal', 
  hideAvatar = false,
  cardWidth = 800,
  cardHeight = 400,
  currentRange = null,
  longestRange = null,
  firstContribution = null,
  lastContribution = null
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
  
  // Use provided width and height, with validation
  const width = Math.max(400, Math.min(2000, Math.round(cardWidth)));
  const height = Math.max(200, Math.min(1200, Math.round(cardHeight)));
  const widthMultiplier = width / 800; // Multiplier for horizontal scaling
  const heightMultiplier = height / 400; // Multiplier for vertical scaling
  const sizeMultiplier = Math.min(widthMultiplier, heightMultiplier); // Use smaller for proportional scaling
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

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

  // Stats container - centered vertically (below username/avatar)
  const statsY = (hideAvatar ? 80 : 140) * vScale;
  const statsHeight = height - statsY - 40 * vScale;
  const sectionWidth = (width - 120 * hScale) / 3; // Three equal sections with padding
  const sectionPadding = 40 * hScale;
  const sectionCenterY = statsY + statsHeight / 2;

  // Left Section: Total Contributions
  const leftX = sectionPadding;
  const leftCenterX = leftX + sectionWidth / 2;
  
  // Calculate vertical spacing for left section
  const leftNumberY = sectionCenterY - 50 * vScale;
  const leftLabelY = sectionCenterY + 10 * vScale;
  const leftDateY = sectionCenterY + 35 * vScale;
  
  // Total number
  ctx.fillStyle = cardColors.totalCommits;
  ctx.font = `bold ${largeNumberSize}px 'Segoe UI', Arial, sans-serif`;
  const totalText = total.toLocaleString();
  const totalTextWidth = ctx.measureText(totalText).width;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
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

  // Middle Section: Current Streak (with circle)
  const middleX = sectionPadding + sectionWidth;
  const middleCenterX = middleX + sectionWidth / 2;
  const circleY = sectionCenterY;
  const circleRadius = 50 * sizeMultiplier;
  
  // Draw circle outline
  ctx.strokeStyle = cardColors.text;
  ctx.lineWidth = 3 * sizeMultiplier;
  ctx.beginPath();
  ctx.arc(middleCenterX, circleY, circleRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Flame icon above circle
  ctx.fillStyle = cardColors.currentStreak;
  ctx.font = `bold ${Math.round(32 * combinedMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
      ctx.fillText("🔥", middleCenterX, circleY - circleRadius - 15 * vScale);
  
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

  // Right Section: Longest Streak
  const rightX = sectionPadding + sectionWidth * 2;
  const rightCenterX = rightX + sectionWidth / 2;
  
  // Calculate vertical spacing for right section (same as left)
  const rightNumberY = sectionCenterY - 50 * vScale;
  const rightLabelY = sectionCenterY + 10 * vScale;
  const rightDateY = sectionCenterY + 35 * vScale;
  
  // Longest number
  ctx.fillStyle = cardColors.longestStreak;
  ctx.font = `bold ${largeNumberSize}px 'Segoe UI', Arial, sans-serif`;
  const longestText = `${longest}`;
  ctx.textBaseline = 'middle';
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
  
  // Reset text alignment
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Vertical divider lines
  ctx.strokeStyle = cardColors.divider;
  ctx.lineWidth = 1 * sizeMultiplier;
  ctx.beginPath();
  ctx.moveTo(middleX, statsY + 20 * vScale);
  ctx.lineTo(middleX, statsY + statsHeight - 20 * vScale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rightX, statsY + 20 * vScale);
  ctx.lineTo(rightX, statsY + statsHeight - 20 * vScale);
  ctx.stroke();

  return canvas.toBuffer("image/png");
}
