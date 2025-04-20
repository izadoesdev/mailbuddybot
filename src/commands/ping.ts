import type { Message } from 'discord.js';
import type { Command } from '../types/Command';

export const ping: Command = {
  name: 'ping',
  description: 'Replies with Pong!',
  async execute(message: Message) {
    await message.reply('Pong!');
  },
}; 