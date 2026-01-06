// /src/utils/streakCard.js
import { createCanvas, loadImage } from "canvas";

export async function generateStreakCard({ username, current, longest, total, avatarUrl, colors = {} }) {
  // Default colors
  const defaultColors = {
    background: "#0d1117",
    backgroundGradient: "#161b22",
    border: "#30363d",
    text: "#f0f6fc",
    accent: "#58a6ff",
    currentStreak: "#f0f6fc",
    longestStreak: "#f0f6fc",
    totalCommits: "#7c3aed",
    avatarBorder: "#58a6ff"
  };
  
  // Merge with custom colors
  const cardColors = { ...defaultColors, ...colors };
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Modern gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, cardColors.background);
  gradient.addColorStop(0.5, cardColors.backgroundGradient);
  gradient.addColorStop(1, cardColors.background);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative border with rounded corners effect
  ctx.strokeStyle = cardColors.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Inner glow effect
  ctx.strokeStyle = "#21262d";
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  // Load avatar with border
  if (avatarUrl) {
    try {
      const avatar = await loadImage(avatarUrl);
      // Draw avatar with circular border
      ctx.save();
      ctx.beginPath();
      ctx.arc(70, 70, 45, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, 25, 25, 90, 90);
      ctx.restore();
      
      // Avatar border
      ctx.strokeStyle = cardColors.avatarBorder;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(70, 70, 45, 0, Math.PI * 2);
      ctx.stroke();
    } catch (err) {
      console.error("Failed to load avatar:", err);
    }
  }

  // Username with modern styling
  ctx.fillStyle = cardColors.text;
  ctx.font = "bold 32px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(username, 150, 65);

  // Stats container background
  const statsY = 120;
  const statsHeight = 240;
  ctx.fillStyle = "rgba(22, 27, 34, 0.6)";
  ctx.fillRect(40, statsY, width - 80, statsHeight);

  // Stats border
  ctx.strokeStyle = "#30363d";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, statsY, width - 80, statsHeight);

  // Three column layout
  const col1X = 70;
  const col2X = 300;
  const col3X = 530;
  const colWidth = 200;

  // Column 1: Current streak
  ctx.fillStyle = cardColors.accent;
  ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Current Streak", col1X, statsY + 35);
  ctx.fillStyle = cardColors.currentStreak;
  ctx.font = "bold 42px 'Segoe UI', Arial, sans-serif";
  const currentText = `${current}`;
  ctx.fillText(currentText, col1X, statsY + 80);
  ctx.fillStyle = "#f85149";
  ctx.font = "bold 32px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("🔥", col1X + ctx.measureText(currentText).width + 10, statsY + 80);

  // Column 2: Longest streak
  ctx.fillStyle = cardColors.accent;
  ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Longest Streak", col2X, statsY + 35);
  ctx.fillStyle = cardColors.longestStreak;
  ctx.font = "bold 42px 'Segoe UI', Arial, sans-serif";
  const longestText = `${longest}`;
  ctx.fillText(longestText, col2X, statsY + 80);
  ctx.fillStyle = "#f1c40f";
  ctx.font = "bold 32px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("🏆", col2X + ctx.measureText(longestText).width + 10, statsY + 80);

  // Column 3: Total commits - make it prominent
  ctx.fillStyle = cardColors.accent;
  ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Total Commits", col3X, statsY + 35);
  ctx.fillStyle = cardColors.totalCommits;
  const totalText = total.toLocaleString();
  // Measure text width first to determine if we need smaller font
  ctx.font = "bold 42px 'Segoe UI', Arial, sans-serif";
  let totalTextWidth = ctx.measureText(totalText).width;
  let totalFontSize = 42;
  // If text is too wide, reduce font size
  if (totalTextWidth > colWidth - 50) {
    totalFontSize = 36;
    ctx.font = `bold ${totalFontSize}px 'Segoe UI', Arial, sans-serif`;
    totalTextWidth = ctx.measureText(totalText).width;
  }
  // Center the text in the column
  const totalX = col3X + Math.max(0, (colWidth - totalTextWidth - 30) / 2);
  ctx.fillText(totalText, totalX, statsY + 80);
  ctx.fillStyle = cardColors.accent;
  ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("📈", totalX + totalTextWidth + 10, statsY + 80);

  // Decorative divider lines
  ctx.strokeStyle = cardColors.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(col2X - 30, statsY + 20);
  ctx.lineTo(col2X - 30, statsY + statsHeight - 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(col3X - 30, statsY + 20);
  ctx.lineTo(col3X - 30, statsY + statsHeight - 20);
  ctx.stroke();

  return canvas.toBuffer("image/png");
}
