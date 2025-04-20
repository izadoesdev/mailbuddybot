import { Collection } from 'discord.js';
import type { Command } from '../types/Command';
import { ping } from '../commands/ping';

export const commands = new Collection<string, Command>();

export async function loadCommands() {
  try {
    commands.set(ping.name, ping);

    console.log('Commands loaded successfully');
  } catch (error) {
    console.error('Error loading commands:', error);
    throw error;
  }
} 