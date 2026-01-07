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
  cardWidth = 800,
  cardHeight = 400
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

/**
 * Generate a contribution graph card showing GitHub contribution calendar
 * Matches GitHub's exact style and layout
 */
export async function generateContributionGraphCard({
  username,
  weeks,
  avatarUrl,
  colors = {},
  fontSize = 'normal',
  hideAvatar = false,
  cardWidth = 800,
  cardHeight = 400
}) {
  const defaultColors = {
    background: "#ffffff",
    text: "#24292e",
    accent: "#0366d6"
  };
  
  const cardColors = { ...defaultColors, ...colors };
  
  const bgColor = cardColors.background || defaultColors.background;
  const isLightBg = bgColor.toLowerCase() === '#ffffff' || 
                     bgColor.toLowerCase() === '#fff' ||
                     (bgColor.startsWith('#') && 
                      parseInt(bgColor.substring(1, 3), 16) > 240 &&
                      parseInt(bgColor.substring(3, 5), 16) > 240 &&
                      parseInt(bgColor.substring(5, 7), 16) > 240);
  
  if (isLightBg) {
    cardColors.text = '#24292e';
    cardColors.accent = colors.accent || '#0366d6';
  } else {
    cardColors.text = '#f0f6fc';
    cardColors.accent = colors.accent || '#58a6ff';
  }
  
  // Optimize dimensions for contribution graph - wider to show more weeks
  const numWeeks = weeks.length;
  const optimalWidth = Math.max(1000, Math.min(2000, Math.round(cardWidth)));
  const optimalHeight = Math.max(300, Math.min(1200, Math.round(cardHeight)));
  
  const width = optimalWidth;
  const height = optimalHeight;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  
  // Background
  ctx.fillStyle = cardColors.background;
  ctx.fillRect(0, 0, width, height);
  
  const fontSizeMultiplier = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.15 : 1.0;
  const sizeMultiplier = Math.min(width / 1000, height / 400);
  
  // Header section - GitHub style (minimal)
  const headerHeight = hideAvatar ? 50 * sizeMultiplier : 80 * sizeMultiplier;
  const headerY = 20 * sizeMultiplier;
  
  // Avatar
  if (!hideAvatar && avatarUrl) {
    try {
      const avatar = await loadImage(avatarUrl);
      const avatarSize = 40 * sizeMultiplier;
      const avatarX = 20 * (width / 1000);
      const avatarY = headerY;
      
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
  
  // Username - GitHub style (smaller, less prominent)
  const usernameX = hideAvatar ? 20 * (width / 1000) : 70 * (width / 1000);
  const usernameY = headerY + 10 * sizeMultiplier;
  ctx.fillStyle = cardColors.text;
  ctx.font = `${Math.round(16 * fontSizeMultiplier * sizeMultiplier)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(username, usernameX, usernameY);
  
  // Graph area - GitHub style layout (weeks as columns, days as rows)
  const graphStartY = headerHeight + 40 * sizeMultiplier;
  const dayLabelsWidth = 35 * sizeMultiplier; // Space for day labels on left
  const monthLabelsHeight = 25 * sizeMultiplier; // Space for month labels on top
  const graphPadding = 20 * (width / 1000);
  const graphWidth = width - dayLabelsWidth - (graphPadding * 2);
  const graphHeight = height - graphStartY - monthLabelsHeight - 20 * sizeMultiplier;
  
  // Calculate square size - GitHub uses ~11px squares with 3px spacing
  // Weeks go horizontally (columns), days go vertically (rows)
  const squareSpacing = 3;
  const squareSize = Math.min(
    (graphWidth - ((numWeeks - 1) * squareSpacing)) / numWeeks, // numWeeks columns
    (graphHeight - (6 * squareSpacing)) / 7 // 7 days, 6 gaps
  );
  const actualSquareSize = Math.max(10, Math.min(12, squareSize));
  
  // Day labels (Mon, Wed, Fri, Sun) - on the left side, vertically aligned
  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
  const dayLabelX = graphPadding + 5;
  ctx.fillStyle = isLightBg ? '#57606a' : '#8b949e';
  ctx.font = `${Math.round(11 * fontSizeMultiplier * sizeMultiplier)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  // Calculate graphY for day labels - align with squares
  const dayLabelGraphY = graphStartY + monthLabelsHeight;
  for (let i = 0; i < 7; i++) {
    if (dayLabels[i]) {
      const y = dayLabelGraphY + (i * (actualSquareSize + squareSpacing)) + (actualSquareSize / 2);
      ctx.fillText(dayLabels[i], dayLabelX, y);
    }
  }
  
  // GitHub's exact contribution colors (fixed thresholds, not percentages)
  const getContributionColor = (count) => {
    if (isLightBg) {
      // GitHub light theme colors (exact hex codes)
      if (count === 0) return '#ebedf0';
      if (count >= 1 && count <= 3) return '#c6e48b';
      if (count >= 4 && count <= 6) return '#7bc96f';
      if (count >= 7 && count <= 9) return '#239a3b';
      return '#196127'; // 10+
    } else {
      // GitHub dark theme colors (exact hex codes)
      if (count === 0) return '#161b22';
      if (count >= 1 && count <= 3) return '#0e4429';
      if (count >= 4 && count <= 6) return '#006d32';
      if (count >= 7 && count <= 9) return '#26a641';
      return '#39d353'; // 10+
    }
  };
  
  // Draw contribution squares - GitHub style (weeks as columns, days as rows)
  const graphX = graphPadding + dayLabelsWidth;
  const graphY = graphStartY + monthLabelsHeight;
  
  // Draw squares with proper alignment
  weeks.forEach((week, weekIndex) => {
    week.contributionDays.forEach((day, dayIndex) => {
      // weekIndex = column (x), dayIndex = row (y)
      const x = graphX + (weekIndex * (actualSquareSize + squareSpacing));
      const y = graphY + (dayIndex * (actualSquareSize + squareSpacing));
      
      const color = getContributionColor(day.contributionCount);
      ctx.fillStyle = color;
      // Draw with slight rounding for better appearance
      ctx.fillRect(Math.round(x), Math.round(y), actualSquareSize, actualSquareSize);
    });
  });
  
  // Month labels - GitHub style (show at top, above weeks)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthY = graphStartY + 5;
  ctx.fillStyle = isLightBg ? '#57606a' : '#8b949e';
  ctx.font = `${Math.round(11 * fontSizeMultiplier * sizeMultiplier)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  let lastMonth = -1;
  let lastMonthX = -1;
  weeks.forEach((week, weekIndex) => {
    if (week.contributionDays.length > 0) {
      const firstDay = week.contributionDays[0];
      const date = new Date(firstDay.date + 'T00:00:00Z');
      const month = date.getUTCMonth();
      const dayOfMonth = date.getUTCDate();
      
      // Show month label at the start of each month (first few days)
      if (month !== lastMonth && dayOfMonth <= 7) {
        const x = graphX + (weekIndex * (actualSquareSize + squareSpacing));
        // Only show if we have space (don't overlap) - allow more frequent labels
        if (lastMonthX === -1 || weekIndex - lastMonthX >= 2) {
          ctx.fillText(months[month], x, monthY);
          lastMonth = month;
          lastMonthX = weekIndex;
        }
      }
    }
  });
  
  return canvas.toBuffer('image/png');
}
