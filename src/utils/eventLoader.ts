import type { Client } from 'discord.js';
import type { Event } from '../types/Event';
import { guildMemberAdd } from '../events/guildMemberAdd';
import { ready } from '../events/ready';

export async function loadEvents(client: Client) {
  try {
    // Ready event
    if (ready.once) {
      client.once(ready.name, (...args) => ready.execute(...args));
    } else {
      client.on(ready.name, (...args) => ready.execute(...args));
    }

    // Member events
    client.on('guildMemberAdd', guildMemberAdd.execute);

    console.log('Events loaded successfully');
  } catch (error) {
    console.error('Error loading events:', error);
    throw error;
  }
} 