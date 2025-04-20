import type { Client } from 'discord.js';
import type { Event } from '../types/Event';

export const ready: Event<'ready'> = {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
  },
}; 