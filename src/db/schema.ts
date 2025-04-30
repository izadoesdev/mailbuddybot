import { integer, pgTable, varchar, timestamp, text, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // Discord user ID
  username: varchar("username", { length: 255 }).notNull(),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(), // Start at level 1 (one-based indexing)
  lastMessageTimestamp: timestamp("last_message_timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reminders = pgTable("reminders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  channelId: varchar("channel_id", { length: 255 }).notNull(),
  reminderText: text("reminder_text").notNull(),
  dueAt: timestamp("due_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commandLogs = pgTable("command_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  command: varchar("command", { length: 255 }).notNull(),
  args: text("args"),
  guildId: varchar("guild_id", { length: 255 }),
  channelId: varchar("channel_id", { length: 255 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => {
  return {
    // Add indexes for better query performance
    timestampIdx: index("command_logs_timestamp_idx").on(table.timestamp),
    userIdIdx: index("command_logs_user_id_idx").on(table.userId),
    commandIdx: index("command_logs_command_idx").on(table.command),
    guildIdIdx: index("command_logs_guild_id_idx").on(table.guildId),
    // Compound index for common query patterns
    userCommandIdx: index("command_logs_user_command_idx").on(table.userId, table.command),
  };
});
