import type { Message } from 'discord.js';
import { commands } from './commandLoader';
import { config } from '../config/config';

export async function handleCommand(message: Message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error('Error executing command:', error);
    await message.reply('There was an error executing that command.');
  }
} 