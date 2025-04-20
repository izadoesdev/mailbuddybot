import 'dotenv/config';

export const config = {
  prefix: process.env.PREFIX || '!',
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
}; 