import { and, eq, lt, sql, gte } from 'drizzle-orm';
import db, { pool } from '../db';
import { users } from '../db/schema';

const MESSAGE_XP_MIN = 5;
const MESSAGE_XP_MAX = 15;
const XP_COOLDOWN_MS = 60000;
const LEVEL_MULTIPLIER = 10;

export function calculateNextLevelXp(level: number): number {
  return Math.floor((level + 1) ** 2 * LEVEL_MULTIPLIER);
}

export function calculateLevelFromXp(xp: number): number {
  const level = Math.floor(Math.sqrt(xp / LEVEL_MULTIPLIER));
  return Math.max(1, level);
}

export function calculateProgress(xp: number, level: number): number {
  const nextLevelXp = calculateNextLevelXp(level);
  const currentLevelXp = level > 1 ? calculateNextLevelXp(level - 1) : 0;
  const levelProgress = xp - currentLevelXp;
  const levelRequirement = nextLevelXp - currentLevelXp;
  
  const progressPercentage = (levelProgress / levelRequirement) * 100;
  return Math.max(0, Math.min(100, Math.floor(progressPercentage)));
}

export function generateProgressBar(progress: number, length: number = 20, filledChar: string = '█', emptyChar: string = '░'): string {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const filled = Math.max(0, Math.round((clampedProgress / 100) * length));
  const empty = Math.max(0, length - filled);
  return filledChar.repeat(filled) + emptyChar.repeat(empty);
}

export function generateMessageXp(): number {
  return Math.floor(Math.random() * (MESSAGE_XP_MAX - MESSAGE_XP_MIN + 1)) + MESSAGE_XP_MIN;
}

export async function getOrCreateUser(userId: string, username: string) {
  // First try to get the user
  const existingUser = await db.select().from(users).where(eq(users.id, userId));
  
  if (existingUser.length > 0) {
    return existingUser[0];
  }
  
  // User doesn't exist, create using a client transaction to avoid race conditions
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check again within transaction to prevent race condition
    const { rows } = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (rows.length > 0) {
      await client.query('COMMIT');
      return rows[0];
    }
    
    // User still doesn't exist, create it
    const backdatedTimestamp = new Date(0);
    const now = new Date();
    
    const insertResult = await client.query(
      `INSERT INTO users (id, username, xp, level, last_message_timestamp, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, username, 0, 1, backdatedTimestamp, now, now]
    );
    
    await client.query('COMMIT');
    
    return insertResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in getOrCreateUser transaction:', error);
    
    // If transaction failed, try one more time to get the user
    // (in case another concurrent request succeeded in creating it)
    const finalCheck = await db.select().from(users).where(eq(users.id, userId));
    
    if (finalCheck.length > 0) {
      return finalCheck[0];
    }
    
    throw error;
  } finally {
    client.release();
  }
}

export async function awardMessageXp(userId: string, username: string) {
  const user = await getOrCreateUser(userId, username);
  
  const now = new Date();
  const lastMessageTime = new Date(user.lastMessageTimestamp);
  const timeSinceLastMessage = now.getTime() - lastMessageTime.getTime();
  
  if (timeSinceLastMessage < XP_COOLDOWN_MS) {
    return {
      xpGained: 0,
      leveledUp: false,
      user
    };
  }
  
  const xpToAdd = generateMessageXp();
  const newXp = user.xp + xpToAdd;
  const oldLevel = user.level;
  const newLevel = calculateLevelFromXp(newXp);
  
  await db.update(users)
    .set({
      xp: newXp,
      level: newLevel,
      lastMessageTimestamp: now,
      updatedAt: now
    })
    .where(eq(users.id, userId));
  
  return {
    xpGained: xpToAdd,
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
    user: {
      ...user,
      xp: newXp,
      level: newLevel,
      lastMessageTimestamp: now
    }
  };
}

export async function getLeaderboard(limit: number = 10) {
  return db.select()
    .from(users)
    .orderBy(sql`${users.xp} DESC`)
    .limit(limit);
} 