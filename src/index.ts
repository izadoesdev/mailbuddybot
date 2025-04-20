import { Client, GatewayIntentBits } from 'discord.js';
import { config } from './config/config';
import { loadEvents } from './utils/eventLoader';
import { loadCommands } from './utils/commandLoader';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function startBot() {
  try {
    await loadCommands();
    await loadEvents(client);
    await client.login(config.token);
    console.log('Bot is online!');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

startBot();
