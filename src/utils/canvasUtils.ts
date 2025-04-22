import { createCanvas, loadImage } from 'canvas';
import { AttachmentBuilder } from 'discord.js';
import { calculateProgress, calculateNextLevelXp } from './xpSystem';

/**
 * Generates a modern progress bar using Canvas
 * @param progress - Progress percentage (0-100)
 * @param width - Width of the progress bar
 * @param height - Height of the progress bar
 * @returns An AttachmentBuilder with the progress bar image
 */
export async function createProgressBar(
  progress: number, 
  width: number = 400, 
  height: number = 40
): Promise<AttachmentBuilder> {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Define colors (Google-style)
  const backgroundColor = '#333333';
  const progressColors = [
    '#4285F4', // Google Blue
    '#34A853', // Google Green
    '#FBBC05', // Google Yellow
    '#EA4335'  // Google Red
  ];
  
  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, height / 2);
  ctx.fill();

  // Calculate progress width
  const progressWidth = (width - 4) * (clampedProgress / 100);
  
  // Skip if no progress
  if (progressWidth <= 0) {
    const buffer = canvas.toBuffer();
    return new AttachmentBuilder(buffer, { name: 'progress.png' });
  }

  // Create gradient for progress
  const gradient = ctx.createLinearGradient(0, 0, progressWidth, 0);
  progressColors.forEach((color, index) => {
    gradient.addColorStop(index / (progressColors.length - 1), color);
  });
  
  // Draw progress bar
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(2, 2, progressWidth, height - 4, (height - 4) / 2);
  ctx.fill();
  
  // Add gloss effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(2, 2, progressWidth, height / 2 - 2, (height - 4) / 2);
  ctx.fill();
  
  // Add progress marker dot at the end of progress (like Google)
  if (progressWidth > 10) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(progressWidth, height / 2, height / 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shadow to marker
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }
  
  // Convert to buffer and create attachment
  const buffer = canvas.toBuffer();
  return new AttachmentBuilder(buffer, { name: 'progress.png' });
}

/**
 * Creates a full rank card with user info and progress bar
 * @param username - User's name
 * @param level - Current level
 * @param xp - Current XP
 * @param requiredXp - XP required for next level
 * @param avatarURL - URL of the user's avatar
 * @returns An AttachmentBuilder with the rank card image
 */
export async function createRankCard(
  username: string,
  level: number,
  xp: number,
  requiredXp: number,
  avatarURL?: string
): Promise<AttachmentBuilder> {
  // Card dimensions
  const width = 500;
  const height = 180;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill background with dark color (like in the image)
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, width, height);
  
  // Add title
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${username}'s Level`, 25, 45);
  
  // Load and draw avatar if available
  if (avatarURL) {
    try {
      const avatar = await loadImage(avatarURL);
      
      // Create circular clip for avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(width - 60, 60, 40, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw avatar
      ctx.drawImage(avatar, width - 100, 20, 80, 80);
      
      ctx.restore();
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  }
  
  // Calculate current level XP threshold
  const currentLevelXp = level > 1 ? calculateNextLevelXp(level - 1) : 0;
  
  // Add level and XP info - simpler layout with more spacing
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Level', 25, 85);
  ctx.fillText('XP', 125, 85);
  ctx.fillText('XP Progress', 225, 85);
  
  ctx.font = '22px Arial';
  ctx.fillText(`${level}`, 25, 115);
  ctx.fillText(`${xp}`, 125, 115);
  ctx.fillText(`${xp-currentLevelXp}/${requiredXp-currentLevelXp}`, 225, 115);
  
  // Add progress label
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Progress', 25, 145);
  
  // Calculate progress percentage using correct method
  const progress = calculateProgress(xp, level);
  
  // Draw the progress bar - simplified like in the image
  const barWidth = 450;
  const barHeight = 16;
  const barY = 155;
  
  // Calculate progress width
  const progressWidth = Math.max(0, barWidth * (progress / 100));
  
  // Create gradient for progress - Google colors as shown in the image
  const progressColors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];
  const gradient = ctx.createLinearGradient(25, 0, 25 + barWidth, 0);
  progressColors.forEach((color, index) => {
    gradient.addColorStop(index / (progressColors.length - 1), color);
  });
  
  // Draw the progress bar background
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.roundRect(25, barY, barWidth, barHeight, barHeight / 2);
  ctx.fill();
  
  // Draw the progress bar fill
  if (progressWidth > 0) {
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(25, barY, progressWidth, barHeight, barHeight / 2);
    ctx.fill();
    
    // Add white dot at the end of progress
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(25 + progressWidth, barY + barHeight/2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Convert to buffer and create attachment
  const buffer = canvas.toBuffer();
  return new AttachmentBuilder(buffer, { name: 'rank.png' });
} 