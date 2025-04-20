import { Collection } from 'discord.js';
import type { Command } from '../types/Command';
import { autorole } from '../commands/autorole';

export const commands = new Collection<string, Command>();

export async function loadCommands() {
  try {
    // Register the autorole command
    commands.set(autorole.data.name, autorole);

    console.log('Commands loaded successfully');
  } catch (error) {
    console.error('Error loading commands:', error);
    throw error;
  }
} 