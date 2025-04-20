import type { Message } from 'discord.js';
import type { Command } from '../types/Command';

export const leaderboard: Command = {
  name: 'leaderboard',
  description: 'View server XP leaderboard',
  async execute(message: Message) {
    if (!message.guild) return;

    try {
      // TODO: Get top 10 users from database
      const topUsers = [
        { username: 'User1', level: 10, xp: 1000 },
        { username: 'User2', level: 8, xp: 800 },
        { username: 'User3', level: 5, xp: 500 },
      ];

      const leaderboardText = topUsers
        .map((user, index) => `${index + 1}. ${user.username} - Level ${user.level} (${user.xp} XP)`)
        .join('\n');

      await message.reply(
        `**${message.guild.name} Leaderboard**\n\`\`\`\n${leaderboardText}\n\`\`\``
      );
    } catch (error) {
      console.error('Error in leaderboard command:', error);
      await message.reply('There was an error fetching the leaderboard.');
    }
  },
}; 