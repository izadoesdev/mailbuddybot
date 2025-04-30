import { EmbedBuilder, type Message } from 'discord.js';
import type { Command } from '../types/Command';
import { commands } from '../utils/commandLoader';
import { config } from '../config/config';

export const help: Command = {
  name: 'help',
  description: 'Shows all available commands',
  async execute(message: Message, args: string[]) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📚 Available Commands')
      .setDescription(`Prefix: \`${config.prefix}\`\n\nHere are all my commands:`);

    const commandList = Array.from(commands.values())
      .map((cmd, index) => `${index + 1}. \`${cmd.name}\` - ${cmd.description}`)
      .join('\n');

    embed.addFields({ name: 'Commands', value: commandList });

    await message.reply({ embeds: [embed] });
  },
}; 