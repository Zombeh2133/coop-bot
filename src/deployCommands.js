import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import * as roomCommand from './commands/room.js';
import * as waitlistCommand from './commands/waitlist.js';
import * as boomCommand from './commands/boom.js';

const commands = [roomCommand.data.toJSON(), waitlistCommand.data.toJSON(), boomCommand.data.toJSON()];
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

const route = process.env.GUILD_ID
  ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
  : Routes.applicationCommands(process.env.CLIENT_ID);

await rest.put(route, { body: commands });
console.log('Commands deployed.');
