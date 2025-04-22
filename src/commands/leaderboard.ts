import { EmbedBuilder, type Message } from 'discord.js';
import type { Command } from '../types/Command';
import { getLeaderboard } from '../utils/xpSystem';

export const leaderboard: Command = {
  name: 'leaderboard',
  description: 'View server XP leaderboard',
  async execute(message: Message) {
    if (!message.guild) return;

    try {
      const topUsers = await getLeaderboard(10);

      if (topUsers.length === 0) {
        await message.reply('No users have earned XP yet.');
        return;
      }

      const leaderboardText = topUsers
        .map((user, index) => `${index + 1}. <@${user.id}> - Level ${user.level} (${user.xp} XP)`)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${message.guild.name} Leaderboard`)
        .setDescription(leaderboardText)
        .setFooter({ text: 'Keep chatting to earn more XP!' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in leaderboard command:', error);
      await message.reply('There was an error fetching the leaderboard.');
    }
  },
}; 