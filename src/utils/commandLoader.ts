import { Collection } from 'discord.js';
import type { Command } from '../types/Command';
import { ping } from '../commands/ping';
import { help } from '../commands/help';
import { serverinfo } from '../commands/serverinfo';
import { userinfo } from '../commands/userinfo';
import { rank } from '../commands/rank';
import { leaderboard } from '../commands/leaderboard';
import { poll } from '../commands/poll';
import { remind } from '../commands/remind';
import { status } from '../commands/status';
import { stats } from '../commands/stats';
import { insights } from '../commands/insights';

export const commands = new Collection<string, Command>();

export async function loadCommands() {
  try {
    commands.set(ping.name, ping);
    commands.set(help.name, help);
    commands.set(serverinfo.name, serverinfo);
    commands.set(userinfo.name, userinfo);
    
    commands.set(poll.name, poll);
    commands.set(remind.name, remind);
    
    commands.set(rank.name, rank);
    commands.set(leaderboard.name, leaderboard);
    commands.set(status.name, status);
    commands.set(stats.name, stats);
    commands.set(insights.name, insights);

    console.log('Commands loaded successfully');
  } catch (error) {
    console.error('Error loading commands:', error);
    throw error;
  }
} 