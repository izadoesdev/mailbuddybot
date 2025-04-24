import { EmbedBuilder } from 'discord.js';
import type { Message } from 'discord.js';
import type { Command } from '../types/Command';
import { getCommandUsageTrend, getPopularCommandCombinations, getCommandSuccessRate } from '../utils/commandUsageHelper';

export const insights: Command = {
  name: 'insights',
  description: 'View advanced command usage insights (usage: !insights [trend|pairs|success] [command] [days])',
  async execute(message: Message, args: string[]) {
    try {
    
      let insightType = 'trend';
      let commandName: string | undefined = undefined;
      let days = 7;

      for (let i = 0; i < args.length; i++) {
        const arg = args[i].toLowerCase();
        
        if (['trend', 'pairs', 'success'].includes(arg)) {
          insightType = arg;
        } else if (!isNaN(Number(arg))) {
          
          days = Math.min(Math.max(parseInt(arg, 10), 1), 30);
        } else if (arg && !['trend', 'pairs', 'success'].includes(arg) && isNaN(Number(arg))) {
          
          commandName = arg;
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Command Usage Insights')
        .setTimestamp();

    
      if (insightType === 'trend') {
        const trendData = await getCommandUsageTrend(commandName, days);
        
        embed.setDescription(`Command usage trend over the last ${days} days` + 
          (commandName ? ` for command \`${commandName}\`` : ''));
        
        if (trendData.length === 0) {
          embed.addFields({ name: 'No Data', value: 'No command usage data found for the specified time period.' });
        } else {
       
          const maxCount = Math.max(...trendData.map(row => Number(row.count)));
          
         
          const chartData = trendData.map(row => {
            
            const dateString = String(row.date);
            const date = new Date(dateString).toLocaleDateString();
            const count = Number(row.count);
            const barLength = Math.max(1, Math.round((count / maxCount) * 15));
            const bar = '█'.repeat(barLength);
            
            return `${date}: ${bar} ${count}`;
          }).join('\n');
          
          embed.addFields({ 
            name: 'Daily Usage', 
            value: '```\n' + chartData + '\n```'
          });
          
        
          const total = trendData.reduce((sum, row) => sum + Number(row.count), 0);
          const avg = (total / trendData.length).toFixed(1);
          
          embed.addFields({ 
            name: 'Summary', 
            value: `Total: ${total} commands\nAverage: ${avg} per day` 
          });
        }
      } else if (insightType === 'pairs') {
        const pairsData = await getPopularCommandCombinations(10);
        
        embed.setDescription('Popular command combinations used together');
        
        if (pairsData.length === 0) {
          embed.addFields({ name: 'No Data', value: 'No command combination data found.' });
        } else {
          embed.addFields({
            name: 'Command Pairs',
            value: pairsData.map((row, index) => 
              `${index + 1}. \`${row.command1}\` + \`${row.command2}\` - ${row.total_count} time${row.total_count !== 1 ? 's' : ''}`
            ).join('\n')
          });
        }
      } else if (insightType === 'success') {
        if (!commandName) {
          embed.setDescription('Please specify a command name to see success rate insights.');
          embed.addFields({ 
            name: 'Usage', 
            value: '!insights success <command_name>' 
          });
        } else {
          const successData = await getCommandSuccessRate(commandName);
          
          embed.setDescription(`Success rate insights for command \`${commandName}\``);
          
          if (successData.total === 0) {
            embed.addFields({ name: 'No Data', value: `No usage data found for command \`${commandName}\`.` });
          } else {
            
            const successPercent = Math.round(successData.rate);
            const successBlocks = Math.round(successPercent / 5);
            const failBlocks = 20 - successBlocks;
            
            const successBar = '█'.repeat(successBlocks) + '░'.repeat(failBlocks);
            
            embed.addFields([
              { 
                name: 'Success Rate', 
                value: '```\n' + successBar + ' ' + successPercent + '%\n```'
              },
              { 
                name: 'Stats', 
                value: `Total: ${successData.total} executions\nSuccessful: ${successData.success}\nFailed: ${successData.total - successData.success}`
              }
            ]);
          }
        }
      }

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error displaying command insights:', error);
      await message.reply('There was an error processing your request.');
    }
  },
}; 