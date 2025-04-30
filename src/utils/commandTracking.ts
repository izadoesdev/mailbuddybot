import type { Message } from 'discord.js';
import db from '../db';
import { commandLogs } from '../db/schema';
import { eq, desc, count, sql, countDistinct, and, gte, lte } from 'drizzle-orm';

/**
 * Interface for time filtering options
 */
export interface TimeFilter {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Logs a command usage to the database
 */
export async function logCommandUsage(message: Message, commandName: string, args: string[]) {
  try {
    await db.insert(commandLogs).values({
      userId: message.author.id,
      username: message.author.tag,
      command: commandName,
      args: args.length > 0 ? args.join(' ') : null,
      guildId: message.guild?.id || null,
      channelId: message.channel.id,
    });
  } catch (error) {
    console.error('Error logging command usage:', error);
  }
}

/**
 * Applies time filters to a query
 */
function applyTimeFilter(timeFilter?: TimeFilter) {
  const conditions = [];
  
  if (timeFilter?.startDate) {
    conditions.push(gte(commandLogs.timestamp, timeFilter.startDate));
  }
  
  if (timeFilter?.endDate) {
    conditions.push(lte(commandLogs.timestamp, timeFilter.endDate));
  }
  
  return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Gets the top N most used commands
 */
export async function getTopCommands(limit: number = 10, timeFilter?: TimeFilter) {
  try {
    const whereCondition = applyTimeFilter(timeFilter);
    
    const query = db
      .select({
        command: commandLogs.command,
        count: count(commandLogs.id),
      })
      .from(commandLogs);
    
    const queryWithFilter = whereCondition 
      ? query.where(whereCondition)
      : query;
    
    const results = await queryWithFilter
      .groupBy(commandLogs.command)
      .orderBy(desc(count(commandLogs.id)))
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error('Error getting top commands:', error);
    throw error;
  }
}

/**
 * Gets the least N used commands
 */
export async function getLeastUsedCommands(limit: number = 10, timeFilter?: TimeFilter) {
  try {
    const whereCondition = applyTimeFilter(timeFilter);
    
    const query = db
      .select({
        command: commandLogs.command,
        count: count(commandLogs.id),
      })
      .from(commandLogs);
    
    const queryWithFilter = whereCondition 
      ? query.where(whereCondition)
      : query;
    
    const results = await queryWithFilter
      .groupBy(commandLogs.command)
      .orderBy(count(commandLogs.id))
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error('Error getting least used commands:', error);
    throw error;
  }
}

/**
 * Gets the top N commands used by a specific user
 */
export async function getUserTopCommands(userId: string, limit: number = 10, timeFilter?: TimeFilter) {
  try {
    const conditions = [eq(commandLogs.userId, userId)];
    const timeCondition = applyTimeFilter(timeFilter);
    
    if (timeCondition) {
      conditions.push(timeCondition);
    }
    
    const results = await db
      .select({
        command: commandLogs.command,
        count: count(commandLogs.id),
      })
      .from(commandLogs)
      .where(and(...conditions))
      .groupBy(commandLogs.command)
      .orderBy(desc(count(commandLogs.id)))
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error('Error getting user top commands:', error);
    throw error;
  }
}

/**
 * Gets the least N commands used by a specific user
 */
export async function getUserLeastCommands(userId: string, limit: number = 10, timeFilter?: TimeFilter) {
  try {
    const conditions = [eq(commandLogs.userId, userId)];
    const timeCondition = applyTimeFilter(timeFilter);
    
    if (timeCondition) {
      conditions.push(timeCondition);
    }
    
    const results = await db
      .select({
        command: commandLogs.command,
        count: count(commandLogs.id),
      })
      .from(commandLogs)
      .where(and(...conditions))
      .groupBy(commandLogs.command)
      .orderBy(count(commandLogs.id))
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error('Error getting user least used commands:', error);
    throw error;
  }
}

/**
 * Gets the top N users by command usage
 */
export async function getTopCommandUsers(limit: number = 10, timeFilter?: TimeFilter) {
  try {
    const whereCondition = applyTimeFilter(timeFilter);
    
    const query = db
      .select({
        userId: commandLogs.userId,
        username: commandLogs.username,
        count: count(commandLogs.id),
      })
      .from(commandLogs);
    
    const queryWithFilter = whereCondition 
      ? query.where(whereCondition)
      : query;
    
    const results = await queryWithFilter
      .groupBy(commandLogs.userId, commandLogs.username)
      .orderBy(desc(count(commandLogs.id)))
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error('Error getting top command users:', error);
    throw error;
  }
}

/**
 * Gets the top N users by command usage with count of unique commands used
 */
export async function getTopCommandUsersWithUnique(limit: number = 10, timeFilter?: TimeFilter) {
  try {
    const whereCondition = applyTimeFilter(timeFilter);
    
    const query = db
      .select({
        userId: commandLogs.userId,
        username: commandLogs.username,
        count: count(commandLogs.id),
        uniqueCommands: countDistinct(commandLogs.command),
      })
      .from(commandLogs);
    
    const queryWithFilter = whereCondition 
      ? query.where(whereCondition)
      : query;
    
    const results = await queryWithFilter
      .groupBy(commandLogs.userId, commandLogs.username)
      .orderBy(desc(count(commandLogs.id)))
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error('Error getting top command users with unique counts:', error);
    throw error;
  }
}

/**
 * Gets command usage statistics by guild/server
 */
export async function getCommandStatsByGuild(limit: number = 10, timeFilter?: TimeFilter) {
  try {
    const conditions = [sql`${commandLogs.guildId} IS NOT NULL`];
    const timeCondition = applyTimeFilter(timeFilter);
    
    if (timeCondition) {
      conditions.push(timeCondition);
    }
    
    const results = await db
      .select({
        guildId: commandLogs.guildId,
        count: count(commandLogs.id),
        uniqueCommands: countDistinct(commandLogs.command),
        uniqueUsers: countDistinct(commandLogs.userId),
      })
      .from(commandLogs)
      .where(and(...conditions))
      .groupBy(commandLogs.guildId)
      .orderBy(desc(count(commandLogs.id)))
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error('Error getting command stats by guild:', error);
    throw error;
  }
} 