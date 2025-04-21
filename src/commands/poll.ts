import { EmbedBuilder, type Message, TextChannel, DMChannel, NewsChannel } from 'discord.js';
import type { Command } from '../types/Command';

export const poll: Command = {
  name: 'poll',
  description: 'Create a poll with up to 10 options (Format: !poll "Question" "Option1" "Option2" ...)',
  async execute(message: Message, args: string[]) {
    // Check if channel is text-based
    if (!(message.channel instanceof TextChannel || message.channel instanceof DMChannel || message.channel instanceof NewsChannel)) {
      return;
    }

    // Delete the command message
    await message.delete().catch(() => {});

    // Match all text within quotes
    const matches = message.content.match(/"[^"]+"/g);
    if (!matches || matches.length < 2) {
      await message.channel.send('❌ Format: !poll "Question" "Option1" "Option2" ...');
      return;
    }

    // Remove quotes from matches
    const [question, ...options] = matches.map(m => m.replace(/"/g, ''));

    if (options.length > 10) {
      await message.channel.send('❌ Maximum 10 options allowed!');
      return;
    }

    // Emoji numbers for reactions
    const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setAuthor({ name: `Poll by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTitle(question)
      .setDescription(
        options
          .map((option, i) => `${numbers[i]} ${option}`)
          .join('\n\n')
      )
      .setFooter({ text: 'React to vote!' })
      .setTimestamp();

    const pollMessage = await message.channel.send({ embeds: [embed] });

    // Add reactions
    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(numbers[i]);
    }
  },
}; 