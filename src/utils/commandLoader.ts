import { Collection } from 'discord.js';
import type { Command } from '../types/Command';

export const commands = new Collection<string, Command>();

export async function loadCommands() {
  try {
    // TODO: Implement dynamic command loading
    console.log('Commands loaded successfully');
  } catch (error) {
    console.error('Error loading commands:', error);
    throw error;
  }
} 