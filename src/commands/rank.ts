import { EmbedBuilder, type Message } from 'discord.js';
import type { Command } from '../types/Command';
import { getOrCreateUser, calculateNextLevelXp, calculateProgress, generateProgressBar } from '../utils/xpSystem';

export const rank: Command = {
  name: 'rank',
  description: 'Check your current level and XP',
  async execute(message: Message) {
    if (!message.guild) return;

    try {
      const target = message.mentions.users.first() || message.author;
      const userData = await getOrCreateUser(target.id, target.username);
      const nextLevelXp = calculateNextLevelXp(userData.level);
      const progress = calculateProgress(userData.xp, userData.level);
      const progressBar = generateProgressBar(progress, 15); // Using 15 blocks for the progress bar

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${target.username}'s Rank`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: 'Level', value: `${userData.level}`, inline: true },
          { name: 'XP', value: `${userData.xp}/${nextLevelXp}`, inline: true },
          { name: '\u200B', value: '\u200B', inline: true },
          { name: 'Progress', value: progressBar }
        )
        .setFooter({ text: 'Keep chatting to earn more XP!' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in rank command:', error);
      await message.reply('There was an error checking your rank.');
    }
  },
}; 