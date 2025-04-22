import { EmbedBuilder, type Message } from 'discord.js';
import type { Command } from '../types/Command';
import { getOrCreateUser, calculateNextLevelXp } from '../utils/xpSystem';

export const status: Command = {
  name: 'status',
  description: 'View detailed info about a user',
  async execute(message: Message) {
    if (!message.guild) return;

    try {
      const target = message.mentions.users.first() || message.author;
      const member = message.guild.members.cache.get(target.id);
      
      if (!member) {
        await message.reply('Could not find that user in this server.');
        return;
      }
      
      const userData = await getOrCreateUser(target.id, target.username);
      const nextLevelXp = calculateNextLevelXp(userData.level);
      const joinDate = member.joinedAt ? 
        `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:D>` : 
        'Unknown';
      const accountCreated = `<t:${Math.floor(target.createdTimestamp / 1000)}:D>`;
      const daysSinceJoin = member.joinedAt ? 
        Math.floor((Date.now() - member.joinedAt.getTime()) / (1000 * 60 * 60 * 24)) : 
        0;
      const roles = member.roles.cache
        .filter(role => role.id !== message.guild?.id)
        .map(role => `<@&${role.id}>`)
        .join(', ') || 'No roles';
      
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${target.username}'s Status`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: 'Status of', value: `<@${target.id}>`, inline: false },
          { name: 'Level', value: `${userData.level}`, inline: true },
          { name: 'XP', value: `${userData.xp} / ${nextLevelXp}`, inline: true },
          { name: 'Join Date', value: joinDate, inline: true },
          { name: 'Account Created', value: accountCreated, inline: true },
          { name: 'Days on server', value: `${daysSinceJoin} days`, inline: true },
          { name: 'Roles', value: roles, inline: false }
        )
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in status command:', error);
      await message.reply('There was an error checking user status.');
    }
  },
}; 