import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadEvents } from './utils/eventLoader';
import { loadCommands } from './utils/commandLoader';
import { handleCommand } from './utils/commandHandler';
import { config } from './config/config';
import 'dotenv/config';
import type { Command } from './types/Command';

// Extend Client to include commands and cooldowns
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
    cooldowns: Collection<string, Collection<string, number>>;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
}) as Client & { 
  commands: Collection<string, Command>;
  cooldowns: Collection<string, Collection<string, number>>;
};

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands and events
async function startBot() {
  try {
    await loadCommands();
    await loadEvents(client);
    await client.login(config.token);

    // Handle messages
    client.on('messageCreate', handleCommand);

  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

startBot();
