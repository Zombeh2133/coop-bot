import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import * as roomCommand from './commands/room.js';
import * as waitlistCommand from './commands/waitlist.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection([
  [roomCommand.data.name, roomCommand],
  [waitlistCommand.data.name, waitlistCommand],
]);

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      const payload = { content: 'Something went wrong running that command.', ephemeral: true };
      if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
      else await interaction.reply(payload);
    }
    return;
  }

  if (interaction.isButton() && interaction.customId.startsWith('waitlist_')) {
    try {
      await waitlistCommand.handleButton(interaction);
    } catch (err) {
      console.error(err);
    }
  }
});

client.once('ready', () => console.log(`Logged in as ${client.user.tag}`));
client.login(process.env.DISCORD_TOKEN);
