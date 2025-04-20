import type { Message } from 'discord.js';

export interface Command {
  name: string;
  description: string;
  cooldown?: number;
  execute: (message: Message, args: string[]) => Promise<void>;
} 