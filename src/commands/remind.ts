import { EmbedBuilder, type Message, TextChannel, DMChannel, NewsChannel } from 'discord.js';
import type { Command } from '../types/Command';

export const remind: Command = {
  name: 'remind',
  description: 'Set a reminder (Format: !remind 1h30m Check the oven)',
  async execute(message: Message, args: string[]) {
    // Check if channel is text-based
    if (!(message.channel instanceof TextChannel || message.channel instanceof DMChannel || message.channel instanceof NewsChannel)) {
      return;
    }

    if (args.length < 2) {
      await message.reply('❌ Format: !remind [time] [reminder]\nExample: !remind 1h30m Check the oven');
      return;
    }

    const timeArg = args[0].toLowerCase();
    const reminder = args.slice(1).join(' ');

    let totalMinutes = 0;
    const hours = timeArg.match(/(\d+)h/);
    const minutes = timeArg.match(/(\d+)m/);

    if (hours) totalMinutes += parseInt(hours[1]) * 60;
    if (minutes) totalMinutes += parseInt(minutes[1]);

    if (totalMinutes === 0) {
      await message.reply('❌ Invalid time format! Use h for hours and m for minutes (e.g., 1h30m)');
      return;
    }

    if (totalMinutes > 1440) {
      await message.reply('❌ Maximum reminder time is 24 hours!');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('⏰ Reminder Set!')
      .setDescription(`I'll remind you about: ${reminder}`)
      .addFields(
        { name: '⏱️ Time', value: `${timeArg}`, inline: true },
        { name: '🔔 When', value: `<t:${Math.floor(Date.now() / 1000 + totalMinutes * 60)}:R>`, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` });

    await message.reply({ embeds: [embed] });

    setTimeout(async () => {
      const reminderEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('⏰ Reminder!')
        .setDescription(reminder)
        .setFooter({ text: `Set ${timeArg} ago` });

      await message.author.send({ embeds: [reminderEmbed] }).catch(async () => {
        await (message.channel as TextChannel | DMChannel | NewsChannel).send({
          content: `${message.author}`,
          embeds: [reminderEmbed]
        });
      });
    }, totalMinutes * 60 * 1000);
  },
}; 