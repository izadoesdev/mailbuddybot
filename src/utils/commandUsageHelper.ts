import type { Message } from 'discord.js';
import { logCommandUsage } from './commandTracking';
import db from '../db';
import { commandLogs } from '../db/schema';
import { eq, count, sql, desc, and } from 'drizzle-orm';

/**
 * Track command usage with improved error handling
 */
export async function trackCommand(message: Message, commandName: string, args: string[]): Promise<boolean> {
  try {
    await logCommandUsage(message, commandName, args);
    return true;
  } catch (error) {
    console.error(`Failed to log command usage for ${commandName}:`, error);
    return false;
  }
}

/**
 * Get command usage trend (last 7 days, daily breakdown)
 */
export async function getCommandUsageTrend(commandName?: string, days: number = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Create conditions
    const conditions = [sql`timestamp >= ${startDate}`];
    if (commandName) {
      conditions.push(eq(commandLogs.command, commandName));
    }
    
    const results = await db
      .select({
        date: sql`DATE(timestamp)`,
        count: count(),
      })
      .from(commandLogs)
      .where(and(...conditions))
      .groupBy(sql`DATE(timestamp)`)
      .orderBy(sql`DATE(timestamp)`);
    
    return results;
  } catch (error) {
    console.error('Error getting command usage trend:', error);
    throw error;
  }
}

/**
 * Get popular command combinations (commands frequently used together by the same user)
 */
export async function getPopularCommandCombinations(limit: number = 10) {
  try {
    const results = await db.execute(sql`
      WITH user_commands AS (
        SELECT 
          user_id, 
          command, 
          DATE(timestamp) as use_date
        FROM command_logs
        ORDER BY user_id, timestamp
      ),
      command_pairs AS (
        SELECT 
          a.user_id,
          a.command as command1,
          b.command as command2,
          COUNT(*) as pair_count
        FROM user_commands a
        JOIN user_commands b 
          ON a.user_id = b.user_id 
          AND a.use_date = b.use_date
          AND a.command < b.command
        GROUP BY a.user_id, a.command, b.command
      )
      SELECT 
        command1,
        command2,
        SUM(pair_count) as total_count
      FROM command_pairs
      GROUP BY command1, command2
      ORDER BY total_count DESC
      LIMIT ${limit}
    `);
    
    return results.rows;
  } catch (error) {
    console.error('Error getting popular command combinations:', error);
    throw error;
  }
}

/**
 * Get command success rate based on error responses
 * Note: This is a basic implementation that assumes error messages contain certain keywords
 * A more robust implementation would require tracking command success/failure explicitly
 */
export async function getCommandSuccessRate(commandName: string) {
  try {
    // Total command executions
    const totalExecutions = await db
      .select({ count: count() })
      .from(commandLogs)
      .where(eq(commandLogs.command, commandName));
    
    // Count commands with error-related args (a very basic approach)
    // This would need to be adapted based on how errors are actually handled and replied to
    const errorKeywords = ['error', 'failed', 'invalid', 'cannot', 'unable'];
    
    let errorConditions = sql`args IS NOT NULL AND (`;
    errorKeywords.forEach((keyword, index) => {
      if (index > 0) errorConditions = sql`${errorConditions} OR `;
      errorConditions = sql`${errorConditions} LOWER(args) LIKE ${'%' + keyword + '%'}`;
    });
    errorConditions = sql`${errorConditions})`;
    
    const errorExecutions = await db
      .select({ count: count() })
      .from(commandLogs)
      .where(sql`${eq(commandLogs.command, commandName)} AND ${errorConditions}`);
    
    const total = totalExecutions[0]?.count || 0;
    const errors = errorExecutions[0]?.count || 0;
    
    if (total === 0) return { success: 0, total: 0, rate: 0 };
    
    const successCount = total - errors;
    const successRate = (successCount / total) * 100;
    
    return {
      success: successCount,
      total,
      rate: successRate,
    };
  } catch (error) {
    console.error(`Error calculating command success rate for ${commandName}:`, error);
    throw error;
  }
} 