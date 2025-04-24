import type { GuildMember,TextChannel } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import type { Event } from '../types/Event';

export const guildMemberAdd: Event<'guildMemberAdd'> = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member: GuildMember) {
    try {
      const autoroleId = '1363144858738495622';

      const role = member.guild.roles.cache.get(autoroleId);
      if (!role) {
        console.error(`Autorole with ID ${autoroleId} not found`);
      }else{
        await member.roles.add(role);
        console.log(`Assigned autorole to ${member.user.tag}`);
      }
      const welcomeChannelId = 'Welcome Channel ID'; //Replace with actual channel ID
      const welcomeMessage = `Welcome to the server, <@${member.id}>! 🎉`;
      const imageUrl = 'https://i.imgur.com/AfFp7pu.png'; // Replace this if needed

      const channel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel;
      if (!channel) {
        console.warn(`Welcome channel with ID ${welcomeChannelId} not found`);
        return;
      }

      const welcomeEmbed = new EmbedBuilder()
        .setColor(0x00ff99)
        .setTitle('👋 New Member Joined')
        .setDescription(welcomeMessage)
        .setImage(imageUrl)
        .setTimestamp();

      await channel.send({ embeds: [welcomeEmbed] });
    } catch (error) {
      console.error('Error in guildMemberAdd event:', error);
    }
  },
};