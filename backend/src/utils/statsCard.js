// /src/utils/statsCard.js
import { createCanvas, loadImage } from "canvas";

/**
 * Generate a card showing top languages - maximized layout
 */
export async function generateLanguagesCard({
  username,
  languages,
  avatarUrl,
  colors = {},
  fontSize = 'normal',
  hideAvatar = false,
  cardWidth = 600,
  cardHeight = 200
}) {
  // Default colors - will be overridden by colors parameter
  const defaultColors = {
    background: "#1e1b4b",
    text: "#ffffff",
    accent: "#ec4899"
  };
  
  // Merge colors, ensuring passed colors take precedence
  const cardColors = { ...defaultColors, ...colors };
  
  // If background is light (white or very light), ensure text is dark
  const bgColor = cardColors.background || defaultColors.background;
  const isLightBg = bgColor.toLowerCase() === '#ffffff' || 
                     bgColor.toLowerCase() === '#fff' ||
                     (bgColor.startsWith('#') && 
                      parseInt(bgColor.substring(1, 3), 16) > 240 &&
                      parseInt(bgColor.substring(3, 5), 16) > 240 &&
                      parseInt(bgColor.substring(5, 7), 16) > 240);
  
  if (isLightBg) {
    // Always force dark text colors for light backgrounds to ensure visibility
    cardColors.text = '#24292e'; // Dark text
    cardColors.accent = colors.accent || '#0366d6'; // Blue accent for visibility
  }
  const width = Math.max(400, Math.min(2000, Math.round(cardWidth)));
  const height = Math.max(200, Math.min(1200, Math.round(cardHeight)));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = cardColors.background;
  ctx.fillRect(0, 0, width, height);

  const fontSizeMultiplier = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.15 : 1.0;
  const sizeMultiplier = Math.min(width / 800, height / 400);

  // Load avatar - smaller to maximize language space
  let avatarX = 40 * (width / 800);
  let avatarY = 40 * (height / 400);
  const avatarSize = hideAvatar ? 0 : 60 * sizeMultiplier;

  if (!hideAvatar) {
    try {
      const avatar = await loadImage(avatarUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch (err) {
      // If avatar fails to load, continue without it
    }
  }

  // Username - smaller to save space
  const usernameX = hideAvatar ? avatarX : avatarX + avatarSize + 15 * (width / 800);
  const usernameY = avatarY + 25 * (height / 400);
  ctx.fillStyle = cardColors.text;
  ctx.font = `bold ${Math.round(28 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(username, usernameX, usernameY);

  // Title - larger and more prominent
  const titleY = usernameY + 40 * (height / 400);
  ctx.fillStyle = cardColors.accent;
  ctx.font = `bold ${Math.round(32 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.fillText('Top Languages', usernameX, titleY);

  // Languages list - maximized layout with larger elements
  const languagesStartY = titleY + 50 * (height / 400);
  const languageHeight = 60 * sizeMultiplier; // Increased from 40
  const languageSpacing = 20 * sizeMultiplier; // Increased spacing
  const topLanguages = languages.slice(0, 3); // Only top 3 languages

  // Calculate total size for percentages
  const totalSize = topLanguages.reduce((sum, l) => sum + l.size, 0);

  topLanguages.forEach((lang, index) => {
    const langY = languagesStartY + (index * (languageHeight + languageSpacing));
    
    // Language color indicator - larger and more prominent
    const colorX = usernameX;
    const colorSize = 30 * sizeMultiplier; // Increased from 20
    ctx.fillStyle = lang.color || '#586e75';
    ctx.fillRect(colorX, langY - colorSize / 2, colorSize, colorSize);
    
    // Language name - larger font
    const langNameX = colorX + colorSize + 20 * (width / 800);
    ctx.fillStyle = cardColors.text;
    ctx.font = `bold ${Math.round(28 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(lang.name, langNameX, langY);

    // Language percentage - larger and more prominent
    const percentage = totalSize > 0 ? ((lang.size / totalSize) * 100).toFixed(1) : '0.0';
    ctx.fillStyle = cardColors.accent;
    ctx.font = `bold ${Math.round(26 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(`${percentage}%`, width - 40 * (width / 800), langY);
    
    // Progress bar visualization
    const barX = langNameX;
    const barY = langY + 20 * sizeMultiplier;
    const barWidth = width - barX - 40 * (width / 800) - 100 * (width / 800); // Leave space for percentage
    const barHeight = 8 * sizeMultiplier;
    
    // Background bar
    ctx.fillStyle = cardColors.background;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.globalAlpha = 1.0;
    
    // Filled bar
    const barFillWidth = (lang.size / totalSize) * barWidth;
    ctx.fillStyle = lang.color || cardColors.accent;
    ctx.fillRect(barX, barY, barFillWidth, barHeight);
  });

  return canvas.toBuffer('image/png');
}

