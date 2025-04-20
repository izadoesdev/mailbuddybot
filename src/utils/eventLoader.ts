import type { Client } from 'discord.js';
import type { Event } from '../types/Event';
import { guildMemberAdd } from '../events/guildMemberAdd';

export async function loadEvents(client: Client) {
  try {
    // Register the guildMemberAdd event
    client.on('guildMemberAdd', guildMemberAdd.execute);

    console.log('Events loaded successfully');
  } catch (error) {
    console.error('Error loading events:', error);
    throw error;
  }
} 