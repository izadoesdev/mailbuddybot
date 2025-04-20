import type { GuildMember } from 'discord.js';
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
        return;
      }

      await member.roles.add(role);
      console.log(`Assigned autorole to ${member.user.tag}`);
    } catch (error) {
      console.error('Error assigning autorole:', error);
    }
  },
}; 