import { EmbedBuilder, type Message } from 'discord.js';
import type { Command } from '../types/Command';

export const serverinfo: Command = {
  name: 'serverinfo',
  description: 'Shows information about the server',
  async execute(message: Message) {
    if (!message.guild) {
      await message.reply('This command can only be used in a server!');
      return;
    }

    const { guild } = message;
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`📊 ${guild.name} Server Information`);

    const iconURL = guild.iconURL({ size: 256 });
    if (iconURL) {
      embed.setThumbnail(iconURL);
    }

    embed.addFields(
      { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
      { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
      { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
      { name: '💬 Channels', value: guild.channels.cache.size.toString(), inline: true },
      { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
      { name: '🌍 Region', value: guild.preferredLocale, inline: true }
    )
    .setFooter({ text: `Server ID: ${guild.id}` });

    await message.reply({ embeds: [embed] });
  },
}; 