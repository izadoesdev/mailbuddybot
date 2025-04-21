import type { Message } from 'discord.js';
import type { Command } from '../types/Command';

export const rank: Command = {
  name: 'rank',
  description: 'Check your current level and XP',
  async execute(message: Message) {
    if (!message.guild) return;

    try {
      const xp = 0;
      const level = 1;
      const nextLevelXp = (level + 1) ** 2 * 10;
      const progress = Math.floor((xp / nextLevelXp) * 100);

      await message.reply(
        `**${message.author.username}'s Rank**\n` +
        `Level: ${level}\n` +
        `XP: ${xp}/${nextLevelXp}\n` +
        `Progress: ${progress}%`
      );
    } catch (error) {
      console.error('Error in rank command:', error);
      await message.reply('There was an error checking your rank.');
    }
  },
}; 