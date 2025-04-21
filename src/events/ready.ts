import type { Client } from 'discord.js';
import type { Event } from '../types/Event';
import { commands } from '../utils/commandLoader';
import { config } from '../config/config';

export const ready: Event<'ready'> = {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    console.log(`\n✅ Bot is online! Logged in as ${client.user?.tag}`);
    console.log(`\nPrefix: ${config.prefix}`);
    console.log('\nAvailable Commands:');
    
    Array.from(commands.values()).forEach((cmd, index) => {
      console.log(`${index + 1}. ${config.prefix}${cmd.name} - ${cmd.description}`);
    });
  },
}; 