import { EmbedBuilder, type Message } from 'discord.js';
import type { Command } from '../types/Command';

export const userinfo: Command = {
  name: 'userinfo',
  description: 'Shows information about a user',
  async execute(message: Message) {
    const target = message.mentions.users.first() || message.author;
    const member = message.guild?.members.cache.get(target.id);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`👤 User Information - ${target.tag}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '🆔 ID', value: target.id, inline: true },
        { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
      );

    if (member && message.guild) {
      const guild = message.guild;
      embed.addFields(
        { name: '📥 Joined Server', value: member.joinedTimestamp 
          ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
          : 'Unknown', inline: true },
        { name: '🎭 Roles', value: member.roles.cache.size > 1
          ? member.roles.cache.filter(role => role.id !== guild.id).map(role => `<@&${role.id}>`).join(', ')
          : 'No roles', inline: false }
      );
    }

    await message.reply({ embeds: [embed] });
  },
}; 