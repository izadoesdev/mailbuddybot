import type { GuildMember, PartialGuildMember, TextChannel } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import type { Event } from '../types/Event';

export const guildMemberRemove: Event<'guildMemberRemove'> = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member) {
    try {
      // Runtime type guard: make sure member has required properties
      if (!('user' in member)) {
        console.warn('guildMemberRemove event received a partial member without "user"');
        return;
      }

      const goodbyeChannelId = 'YOUR_GOODBYE_CHANNEL_ID'; // Replace this
      const goodbyeMessage = `<@${member.id}> has left the server. 😢`;
      const imageUrl = 'https://i.imgur.com/El8wX6H.png'; // Replace this if needed

      const channel = member.guild.channels.cache.get(goodbyeChannelId) as TextChannel;
      if (!channel) {
        console.warn(`Goodbye channel with ID ${goodbyeChannelId} not found`);
        return;
      }

      const goodbyeEmbed = new EmbedBuilder()
        .setColor(0xff5555)
        .setTitle('👋 Member Left')
        .setDescription(goodbyeMessage)
        .setImage(imageUrl)
        .setTimestamp();

      await channel.send({ embeds: [goodbyeEmbed] });
    } catch (error) {
      console.error('Error in guildMemberRemove event:', error);
    }
  },
};
