import { type Message } from 'discord.js';
import type { Command } from '../types/Command';
import { getOrCreateUser, calculateNextLevelXp, calculateProgress } from '../utils/xpSystem';
import { createRankCard } from '../utils/canvasUtils';

export const rank: Command = {
  name: 'rank',
  description: 'Check your current level and XP',
  async execute(message: Message) {
    if (!message.guild) return;

    try {
      const target = message.mentions.users.first() || message.author;
      
      const userData = await getOrCreateUser(target.id, target.username);
      
      const nextLevelXp = calculateNextLevelXp(userData.level);
      
      const avatarURL = target.displayAvatarURL({ extension: 'png', size: 256 });
      
      const rankCard = await createRankCard(
        target.username,
        userData.level,
        userData.xp,
        nextLevelXp,
        avatarURL
      );

      await message.reply({ files: [rankCard] });
    } catch (error) {
      console.error('Error in rank command:', error);
      await message.reply('There was an error checking your rank.');
    }
  },
}; 