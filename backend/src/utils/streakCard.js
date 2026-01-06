import { createCanvas, loadImage } from "canvas";
import fs from "fs";

export async function generateStreakCard({ username, current, longest }) {
  const width = 600;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, width, height);

  // Username
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px Sans";
  ctx.fillText(username, 40, 50);

  // Current streak
  ctx.fillStyle = "#00ff00";
  ctx.font = "bold 26px Sans";
  ctx.fillText(`Current Streak: ${current} 🔥`, 40, 100);

  // Longest streak
  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 26px Sans";
  ctx.fillText(`Longest Streak: ${longest} 🏆`, 40, 150);

  // Optional: add border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, width, height);

  // Return buffer
  return canvas.toBuffer("image/png");
}
