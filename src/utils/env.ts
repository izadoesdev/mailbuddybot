import z from 'zod';

const envSchema = z.object({
  DISCORD_TOKEN: z.string(),
  CLIENT_ID: z.string(),
  GUILD_ID: z.string(),
  DATABASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
