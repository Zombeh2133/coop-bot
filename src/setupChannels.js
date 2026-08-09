import 'dotenv/config';
import { Client, GatewayIntentBits, ChannelType } from 'discord.js';

const ROOM_COUNT = 20;
const CATEGORY_NAME = 'Co-Op';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const channels = await guild.channels.fetch();

  let category = channels.find((c) => c.type === ChannelType.GuildCategory && c.name === CATEGORY_NAME);
  if (!category) {
    category = await guild.channels.create({ name: CATEGORY_NAME, type: ChannelType.GuildCategory });
  }

  for (let i = 1; i <= ROOM_COUNT; i++) {
    const name = `g${i}-xxxxx`;
    const exists = channels.find((c) => c.parentId === category.id && c.name.startsWith(`g${i}-`));
    if (exists) continue;
    await guild.channels.create({ name, type: ChannelType.GuildText, parent: category.id });
    console.log(`Created ${name}`);
  }

  console.log('Done setting up room channels.');
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
