import type { Message } from 'discord.js';
import type { Event } from '../types/Event';
import { EmbedBuilder, TextChannel, DMChannel, NewsChannel } from 'discord.js';
import { awardMessageXp, calculateNextLevelXp } from '../utils/xpSystem';
import { createProgressBar } from '../utils/canvasUtils';
import { config } from '../config/config';

export const messageCreate: Event<'messageCreate'> = {
  name: 'messageCreate',
  once: false,
  async execute(message: Message) {
    if (message.author.bot) return;
    
    try {
      if (message.guild) {
        const result = await awardMessageXp(message.author.id, message.author.username);
        
        if (result.leveledUp && result.newLevel) {
          if (message.channel instanceof TextChannel || 
              message.channel instanceof DMChannel || 
              message.channel instanceof NewsChannel) {
            
            const nextLevelXp = calculateNextLevelXp(result.newLevel);
            const progress = Math.floor((result.user.xp / nextLevelXp) * 100);
            const progressBar = await createProgressBar(progress);
            
            const levelUpEmbed = new EmbedBuilder()
              .setColor('#00ff00')
              .setTitle('🎉 Level Up!')
              .setDescription(`Congratulations ${message.author}! You've reached level **${result.newLevel}**!`)
              .setThumbnail(message.author.displayAvatarURL())
              .addFields(
                { name: 'New Level', value: `${result.newLevel}`, inline: true },
                { name: 'XP', value: `${result.user.xp}/${nextLevelXp}`, inline: true }
              )
              .setFooter({ text: `Use ${config.prefix}rank to see your full progress` });
            
            await message.channel.send({ 
              embeds: [levelUpEmbed],
              files: [progressBar]
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing message for XP:', error);
    }
  },
};