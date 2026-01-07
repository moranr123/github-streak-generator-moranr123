// /src/utils/statsCard.js
import { createCanvas, loadImage } from "canvas";

/**
 * Generate a card showing top languages
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
  const defaultColors = {
    background: "#1e1b4b",
    text: "#ffffff",
    accent: "#ec4899"
  };
  
  const cardColors = { ...defaultColors, ...colors };
  const width = Math.max(400, Math.min(2000, Math.round(cardWidth)));
  const height = Math.max(200, Math.min(1200, Math.round(cardHeight)));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = cardColors.background;
  ctx.fillRect(0, 0, width, height);

  const fontSizeMultiplier = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.15 : 1.0;
  const sizeMultiplier = Math.min(width / 800, height / 400);

  // Load avatar
  let avatarX = 40 * (width / 800);
  let avatarY = 40 * (height / 400);
  const avatarSize = 80 * sizeMultiplier;

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

  // Username
  const usernameX = hideAvatar ? avatarX : avatarX + avatarSize + 20 * (width / 800);
  const usernameY = avatarY + 30 * (height / 400);
  ctx.fillStyle = cardColors.text;
  ctx.font = `bold ${Math.round(32 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(username, usernameX, usernameY);

  // Title
  const titleY = usernameY + 50 * (height / 400);
  ctx.fillStyle = cardColors.accent;
  ctx.font = `${Math.round(24 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.fillText('Top Languages', usernameX, titleY);

  // Languages list
  const languagesStartY = titleY + 60 * (height / 400);
  const languageHeight = 40 * sizeMultiplier;
  const maxLanguages = Math.min(languages.length, 8);

  languages.slice(0, maxLanguages).forEach((lang, index) => {
    const langY = languagesStartY + (index * (languageHeight + 10 * sizeMultiplier));
    
    // Language name
    ctx.fillStyle = cardColors.text;
    ctx.font = `bold ${Math.round(20 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillText(lang.name, usernameX, langY);

    // Language color indicator
    const colorX = usernameX + 150 * (width / 800);
    ctx.fillStyle = lang.color || '#586e75';
    ctx.fillRect(colorX, langY - 15 * sizeMultiplier, 20 * sizeMultiplier, 20 * sizeMultiplier);

    // Language percentage (simplified - showing relative size)
    const totalSize = languages.reduce((sum, l) => sum + l.size, 0);
    const percentage = ((lang.size / totalSize) * 100).toFixed(1);
    ctx.fillStyle = cardColors.accent;
    ctx.font = `${Math.round(18 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(`${percentage}%`, width - 40 * (width / 800), langY);
    ctx.textAlign = 'left';
  });

  return canvas.toBuffer('image/png');
}

/**
 * Generate a card showing total contributions
 */
export async function generateContributionsCard({
  username,
  total,
  avatarUrl,
  colors = {},
  fontSize = 'normal',
  hideAvatar = false,
  cardWidth = 800,
  cardHeight = 400
}) {
  const defaultColors = {
    background: "#1e1b4b",
    text: "#ffffff",
    accent: "#f97316"
  };
  
  const cardColors = { ...defaultColors, ...colors };
  const width = Math.max(400, Math.min(2000, Math.round(cardWidth)));
  const height = Math.max(200, Math.min(1200, Math.round(cardHeight)));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = cardColors.background;
  ctx.fillRect(0, 0, width, height);

  const fontSizeMultiplier = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.15 : 1.0;
  const sizeMultiplier = Math.min(width / 800, height / 400);

  // Load avatar
  let avatarX = 40 * (width / 800);
  let avatarY = 40 * (height / 400);
  const avatarSize = 120 * sizeMultiplier;

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

  // Center content
  const centerX = width / 2;
  const centerY = height / 2;

  // Total contributions number
  ctx.fillStyle = cardColors.accent;
  ctx.font = `bold ${Math.round(72 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total.toLocaleString(), centerX, centerY - 40 * (height / 400));

  // Label
  ctx.fillStyle = cardColors.text;
  ctx.font = `${Math.round(32 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.fillText('Total Contributions', centerX, centerY + 40 * (height / 400));

  // Username
  const usernameY = hideAvatar ? centerY + 100 * (height / 400) : avatarY + avatarSize + 30 * (height / 400);
  ctx.fillStyle = cardColors.text;
  ctx.font = `bold ${Math.round(28 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.fillText(`@${username}`, centerX, usernameY);

  return canvas.toBuffer('image/png');
}

/**
 * Generate a card showing repository count
 */
export async function generateRepositoriesCard({
  username,
  repositoryCount,
  avatarUrl,
  colors = {},
  fontSize = 'normal',
  hideAvatar = false,
  cardWidth = 800,
  cardHeight = 400
}) {
  const defaultColors = {
    background: "#1e1b4b",
    text: "#ffffff",
    accent: "#10b981"
  };
  
  const cardColors = { ...defaultColors, ...colors };
  const width = Math.max(400, Math.min(2000, Math.round(cardWidth)));
  const height = Math.max(200, Math.min(1200, Math.round(cardHeight)));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = cardColors.background;
  ctx.fillRect(0, 0, width, height);

  const fontSizeMultiplier = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.15 : 1.0;
  const sizeMultiplier = Math.min(width / 800, height / 400);

  // Load avatar
  let avatarX = 40 * (width / 800);
  let avatarY = 40 * (height / 400);
  const avatarSize = 120 * sizeMultiplier;

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

  // Center content
  const centerX = width / 2;
  const centerY = height / 2;

  // Repository count
  ctx.fillStyle = cardColors.accent;
  ctx.font = `bold ${Math.round(72 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(repositoryCount.toLocaleString(), centerX, centerY - 40 * (height / 400));

  // Label
  ctx.fillStyle = cardColors.text;
  ctx.font = `${Math.round(32 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.fillText('Repositories', centerX, centerY + 40 * (height / 400));

  // Username
  const usernameY = hideAvatar ? centerY + 100 * (height / 400) : avatarY + avatarSize + 30 * (height / 400);
  ctx.fillStyle = cardColors.text;
  ctx.font = `bold ${Math.round(28 * fontSizeMultiplier * sizeMultiplier)}px 'Segoe UI', Arial, sans-serif`;
  ctx.fillText(`@${username}`, centerX, usernameY);

  return canvas.toBuffer('image/png');
}
