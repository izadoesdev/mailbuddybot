import { Client, GatewayIntentBits } from 'discord.js';
import { loadEvents } from './utils/eventLoader';
import { loadCommands } from './utils/commandLoader';
import { handleCommand } from './utils/commandHandler';
import { config } from './config/config';
import 'dotenv/config';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on('message', handleCommand);

async function startBot() {
  try {
    await loadCommands();
    await loadEvents(client);
    await client.login(config.token);
    console.log('Bot is online!');
    console.log(`Prefix: ${config.prefix}`);
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}
 
startBot();
