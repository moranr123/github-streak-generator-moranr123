// /src/utils/statsCard.js
import { createCanvas, loadImage } from "canvas";
import { isLightBackground } from "./colorUtils.js";

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
  const isLightBg = isLightBackground(bgColor);
  
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

/**
 * Generate a card showing repository statistics
 */
export async function generateRepositoryStatsCard({
  username,
  stats,
  avatarUrl,
  colors = {},
  fontSize = 'normal',
  hideAvatar = false,
  cardWidth = 600,
  cardHeight = 200
}) {
  // Default colors
  const defaultColors = {
    background: "#1e1b4b",
    text: "#ffffff",
    accent: "#ec4899"
  };
  
  const cardColors = { ...defaultColors, ...colors };
  
  const bgColor = cardColors.background || defaultColors.background;
  const isLightBg = isLightBackground(bgColor);
  
  if (isLightBg) {
    cardColors.text = '#24292e';
    cardColors.accent = colors.accent || '#0366d6';
  }
  
  const width = Math.max(400, Math.min(2000, Math.round(cardWidth)));
  const height = Math.max(200, Math.min(1200, Math.round(cardHeight)));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  
  // Background
  ctx.fillStyle = cardColors.background;
  ctx.fillRect(0, 0, width, height);
  
  const fontSizeMultiplier = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.15 : 1.0;
  // Responsive scaling - use proportional scaling based on card dimensions
  const baseWidth = 600;
  const baseHeight = 200;
  const widthScale = width / baseWidth;
  const heightScale = height / baseHeight;
  const sizeMultiplier = Math.min(widthScale, heightScale, 1.5); // Cap at 1.5x for very large cards
  
  // Avatar - responsive positioning
  const avatarX = 20 * widthScale;
  const avatarY = 20 * heightScale;
  const avatarSize = hideAvatar ? 0 : Math.min(50 * sizeMultiplier, height * 0.25);
  
  if (!hideAvatar && avatarUrl) {
    try {
      const avatar = await loadImage(avatarUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch (err) {
      // Continue without avatar if it fails to load
    }
  }
  
  // Username - responsive positioning
  const usernameX = hideAvatar ? avatarX : avatarX + avatarSize + 15 * widthScale;
  const usernameY = avatarY + avatarSize / 2;
  const usernameFontSize = Math.round(24 * fontSizeMultiplier * sizeMultiplier);
  ctx.fillStyle = cardColors.text;
  ctx.font = `bold ${usernameFontSize}px 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(username, usernameX, usernameY);
  
  // Title - responsive positioning (minimal gap from username, based on font size)
  const titleY = usernameY + (usernameFontSize / 2) + 2 * heightScale;
  ctx.fillStyle = cardColors.accent;
  ctx.font = `bold ${Math.round(20 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Repository Statistics', usernameX, titleY);
  
  // Stats section - responsive positioning with compact spacing
  // Calculate available height for stats
  const bottomPadding = 15 * heightScale;
  const availableHeight = height - titleY - bottomPadding;
  
  // Use compact spacing that fits within available height
  const numRows = 3; // We have 3 rows of stats
  const rowGap = 5 * sizeMultiplier; // Small gap between each row pair
  const statItemHeight = Math.min((availableHeight - (rowGap * (numRows - 1))) / numRows, 30 * sizeMultiplier);
  const statsStartY = titleY + 25 * heightScale;
  
  const statLabelFont = `${Math.round(10 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  const statValueFont = `bold ${Math.round(18 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  
  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };
  
  // Calculate column positions - responsive based on card width
  const padding = 20 * widthScale;
  const availableWidth = width - usernameX - padding;
  const columnGap = Math.max(20 * widthScale, 20); // Minimum 20px gap
  const columnWidth = (availableWidth - columnGap) / 2;
  const leftColumnX = usernameX;
  const rightColumnX = usernameX + columnWidth + columnGap;
  
  // Define stats in pairs (left, right)
  const statPairs = [
    [
      { label: 'Total Repos', value: formatNumber(stats.totalRepos) },
      { label: 'Public', value: formatNumber(stats.publicRepos) }
    ],
    [
      { label: 'Private', value: formatNumber(stats.privateRepos) },
      { label: 'Forks', value: formatNumber(stats.forks) }
    ],
    [
      { label: 'Total Stars', value: formatNumber(stats.totalStars) },
      { label: 'Total Forks', value: formatNumber(stats.totalForks) }
    ]
  ];
  
  // Draw stats in rows with compact spacing and gaps between pairs
  statPairs.forEach((pair, rowIndex) => {
    const rowY = statsStartY + (rowIndex * (statItemHeight + rowGap));
    const labelOffset = 12 * sizeMultiplier; // Compact spacing between label and value
    
    // Draw left stat
    const leftStat = pair[0];
    ctx.fillStyle = isLightBg ? '#586069' : '#8b949e';
    ctx.font = statLabelFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(leftStat.label, leftColumnX, rowY);
    
    ctx.fillStyle = cardColors.text;
    ctx.font = statValueFont;
    ctx.textBaseline = 'top';
    ctx.fillText(leftStat.value, leftColumnX, rowY + labelOffset);
    
    // Draw right stat
    const rightStat = pair[1];
    ctx.fillStyle = isLightBg ? '#586069' : '#8b949e';
    ctx.font = statLabelFont;
    ctx.fillText(rightStat.label, rightColumnX, rowY);
    
    ctx.fillStyle = cardColors.text;
    ctx.font = statValueFont;
    ctx.fillText(rightStat.value, rightColumnX, rowY + labelOffset);
  });
  
  // Most starred repo (if available and space permits)
  if (stats.mostStarredRepo && stats.mostStarredRepo.stars > 0) {
    const lastRowY = statsStartY + (statPairs.length * statItemHeight);
    const remainingHeight = height - lastRowY - bottomPadding;
    
    // Only show if there's enough space
    if (remainingHeight >= 30 * sizeMultiplier) {
      const repoY = lastRowY + 10 * sizeMultiplier;
      
      ctx.fillStyle = isLightBg ? '#586069' : '#8b949e';
      ctx.font = statLabelFont;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Most Starred', usernameX, repoY);
      
      ctx.fillStyle = cardColors.accent;
      ctx.font = `${Math.round(12 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
      const repoText = `${stats.mostStarredRepo.name} (${formatNumber(stats.mostStarredRepo.stars)} ⭐)`;
      ctx.fillText(repoText, usernameX, repoY + 12 * sizeMultiplier);
    }
  }
  
  return canvas.toBuffer('image/png');
}

