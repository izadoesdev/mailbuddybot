import { EmbedBuilder } from 'discord.js';
import type { Message } from 'discord.js';
import type { Command } from '../types/Command';
import { 
  getTopCommands, 
  getLeastUsedCommands, 
  getUserTopCommands, 
  getUserLeastCommands, 
  getTopCommandUsers,
  getTopCommandUsersWithUnique,
  getCommandStatsByGuild,
  TimeFilter
} from '../utils/commandTracking';
import { commands } from '../utils/commandLoader';

export const stats: Command = {
  name: 'stats',
  description: 'View command usage statistics (usage: !stats [top|least] [commands|users|servers] [limit] [for @user/username] [time day|week|month|all])',
  async execute(message: Message, args: string[]) {
    try {
     
      let type = 'top';
      let target = 'command';
      let limit = 10;
      let userId = '';
      let targetUsername = '';
      let timeRange: string | null = null;

      for (let i = 0; i < args.length; i++) {
        const arg = args[i].toLowerCase();
        
        if (arg === 'top' || arg === 'least') {
          type = arg;
        } else if (arg === 'commands' || arg === 'command') {
          target = 'command';
        } else if (arg === 'users' || arg === 'user') {
          target = 'user';
        } else if (arg === 'servers' || arg === 'server' || arg === 'guilds' || arg === 'guild') {
          target = 'server';
        } else if (arg === 'for' && i + 1 < args.length) {
          // If "for" is followed by a user mention or ID or username
          const userReference = args[i + 1];
          
          // Check if it's a mention
          if (userReference.startsWith('<@') && userReference.endsWith('>')) {
            userId = userReference.replace(/[<@!>]/g, ''); // Extract ID from mention
          } 
          // Check if it's a raw ID (numeric only)
          else if (/^\d+$/.test(userReference)) {
            userId = userReference;
          } 
          // Otherwise treat as a username
          else {
            targetUsername = userReference;
            
            let j = i + 2;
            while (j < args.length && args[j] !== 'top' && args[j] !== 'least' && 
                 args[j] !== 'commands' && args[j] !== 'command' && 
                 args[j] !== 'users' && args[j] !== 'user' && 
                 args[j] !== 'servers' && args[j] !== 'server' && 
                 args[j] !== 'guilds' && args[j] !== 'guild' && 
                 args[j] !== 'time' &&
                 isNaN(Number(args[j]))) {
              targetUsername += ' ' + args[j];
              j++;
            }
            i = j - 1; 
          }
          
          i++; 
        } else if (arg === 'time' && i + 1 < args.length) {
      
          timeRange = args[i + 1].toLowerCase();
          if (!['day', 'week', 'month', 'all'].includes(timeRange)) {
            await message.reply(`Invalid time range "${timeRange}". Valid options are: day, week, month, all.`);
            return;
          }
          i++;
        } else if (!isNaN(Number(arg))) {
         
          limit = Math.min(Math.max(parseInt(arg, 10), 1), 25); 
        }
      }

      
      const timeFilter: TimeFilter = {};
      if (timeRange && timeRange !== 'all') {
        const now = new Date();
        timeFilter.endDate = now;
        
        if (timeRange === 'day') {
          const oneDayAgo = new Date(now);
          oneDayAgo.setDate(now.getDate() - 1);
          timeFilter.startDate = oneDayAgo;
        } else if (timeRange === 'week') {
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          timeFilter.startDate = oneWeekAgo;
        } else if (timeRange === 'month') {
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          timeFilter.startDate = oneMonthAgo;
        }
      }

      
      if (targetUsername && !userId) {
        const targetUser = message.guild?.members.cache.find(
          member => member.user.username.toLowerCase() === targetUsername.toLowerCase() ||
                   (member.nickname && member.nickname.toLowerCase() === targetUsername.toLowerCase())
        );
        
        if (targetUser) {
          userId = targetUser.id;
        } else {
          await message.reply(`Could not find a user with the name "${targetUsername}". Please try using a mention (@user) instead.`);
          return;
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Command Usage Statistics')
        .setTimestamp();
      
      
      let timeDescription = '';
      if (timeRange && timeRange !== 'all') {
        timeDescription = ` (Last ${timeRange})`;
      }

     
      if (target === 'command') {
        if (userId) {
          
          const userCommandData = type === 'top' 
            ? await getUserTopCommands(userId, limit, timeFilter)
            : await getUserLeastCommands(userId, limit, timeFilter);
          
          const targetMember = message.guild?.members.cache.get(userId);
          const displayName = targetMember ? targetMember.displayName : `<@${userId}>`;
          
          embed.setDescription(`${type === 'top' ? 'Top' : 'Least'} used commands by ${displayName}${timeDescription}`);
          
          if (userCommandData.length === 0) {
            embed.addFields({ name: 'No Data', value: 'No command usage data found for this user in the specified time period.' });
          } else {
           
            if (type === 'least') {
            
              const allCommandNames = Array.from(commands.keys());
              
              
              const userCommandsMap = new Map(
                userCommandData.map(row => [row.command, row.count])
              );
              
              const combinedCommandsList: Array<{command: string, count: number}> = [];
              
              for (const entry of userCommandData) {
                combinedCommandsList.push(entry);
              }
              
              for (const cmdName of allCommandNames) {
                if (!userCommandsMap.has(cmdName)) {
                  combinedCommandsList.push({ command: cmdName, count: 0 });
                }
              }
              

              const displayLimit = Math.min(limit, combinedCommandsList.length);
              
              embed.addFields({
                name: 'Command Usage',
                value: combinedCommandsList.slice(0, displayLimit).map((row, index) => 
                  `${index + 1}. \`${row.command}\` - ${row.count} use${row.count !== 1 ? 's' : ''}`
                ).join('\n')
              });
            } else {
              embed.addFields({
                name: 'Command Usage',
                value: userCommandData.map((row, index) => 
                  `${index + 1}. \`${row.command}\` - ${row.count} use${row.count !== 1 ? 's' : ''}`
                ).join('\n')
              });
            }
          }
        } else {
          const commandData = type === 'top' 
            ? await getTopCommands(limit, timeFilter) 
            : await getLeastUsedCommands(limit, timeFilter);
          
          embed.setDescription(`${type === 'top' ? 'Top' : 'Least'} used commands overall${timeDescription}`);
          
          if (commandData.length === 0) {
            embed.addFields({ name: 'No Data', value: 'No command usage data found for the specified time period.' });
          } else {
            if (type === 'least') {
              const allCommandNames = Array.from(commands.keys());
              
              const usedCommandsMap = new Map(
                commandData.map(row => [row.command, row.count])
              );
              
              const combinedCommandsList: Array<{command: string, count: number}> = [];
              
              for (const entry of commandData) {
                combinedCommandsList.push(entry);
              }
              
              for (const cmdName of allCommandNames) {
                if (!usedCommandsMap.has(cmdName)) {
                  combinedCommandsList.push({ command: cmdName, count: 0 });
                }
              }
              
              const displayLimit = Math.min(limit, combinedCommandsList.length);
              
              embed.addFields({
                name: 'Command Usage',
                value: combinedCommandsList.slice(0, displayLimit).map((row, index) => 
                  `${index + 1}. \`${row.command}\` - ${row.count} use${row.count !== 1 ? 's' : ''}`
                ).join('\n')
              });
            } else {
             
              embed.addFields({
                name: 'Command Usage',
                value: commandData.map((row, index) => 
                  `${index + 1}. \`${row.command}\` - ${row.count} use${row.count !== 1 ? 's' : ''}`
                ).join('\n')
              });
            }
          }
        }
      } else if (target === 'user') {
       
        const data = await getTopCommandUsersWithUnique(limit, timeFilter);
        
        embed.setDescription(`Top ${limit} users by command usage${timeDescription}`);
        
        if (data.length === 0) {
          embed.addFields({ name: 'No Data', value: 'No command usage data found for the specified time period.' });
        } else {
          embed.addFields({
            name: 'User Command Usage',
            value: data.map((row, index) => 
              `${index + 1}. ${row.username} - ${row.count} total use${row.count !== 1 ? 's' : ''} (${row.uniqueCommands} unique command${row.uniqueCommands !== 1 ? 's' : ''})`
            ).join('\n')
          });
        }
      } else if (target === 'server') {
       
        const data = await getCommandStatsByGuild(limit, timeFilter);
        
        embed.setDescription(`Top ${limit} servers by command usage${timeDescription}`);
        
        if (data.length === 0) {
          embed.addFields({ name: 'No Data', value: 'No server command usage data found for the specified time period.' });
        } else {
          embed.addFields({
            name: 'Server Command Usage',
            value: data.map((row, index) => {
              const guildName = message.client.guilds.cache.get(row.guildId || '')?.name || row.guildId;
              return `${index + 1}. ${guildName} - ${row.count} total use${row.count !== 1 ? 's' : ''} (${row.uniqueCommands} unique command${row.uniqueCommands !== 1 ? 's' : ''}, ${row.uniqueUsers} unique user${row.uniqueUsers !== 1 ? 's' : ''})`;
            }).join('\n')
          });
        }
      }

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error displaying command stats:', error);
      await message.reply('There was an error processing your request.');
    }
  },
}; 