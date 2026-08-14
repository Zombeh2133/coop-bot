import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getRoom, setSong, addToQueue, removeFromQueue, advancePinged } from '../state.js';

function buildWaitlistEmbed(room) {
  const lines = room.queue.length
    ? room.queue.map((id, i) => `${i + 1}. <@${id}>${id === room.pinged ? ' — **pinged**' : ''}`).join('\n')
    : 'No users in queue';
  const embed = new EmbedBuilder().setTitle('Waitlist Queue').setColor(0x57f287);
  if (room.song) embed.addFields({ name: 'Song', value: room.song });
  embed.addFields({ name: 'Waitlist Users', value: lines });
  return embed;
}

function buildWaitlistRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('waitlist_join').setLabel('Join').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('waitlist_leave').setLabel('Leave').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('waitlist_pingnext').setLabel('Ping Next').setStyle(ButtonStyle.Secondary),
  );
}

export const data = new SlashCommandBuilder()
  .setName('waitlist')
  .setDescription("Manage this room's waitlist queue")
  .addSubcommand((sub) =>
    sub
      .setName('show')
      .setDescription('Show/refresh the waitlist for this channel')
      .addStringOption((opt) => opt.setName('song').setDescription('Song for this room').setRequired(false)),
  );

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  if (sub !== 'show') return;

  const song = interaction.options.getString('song');
  if (song) setSong(interaction.channel.id, song);

  const room = getRoom(interaction.channel.id);
  await interaction.reply({ embeds: [buildWaitlistEmbed(room)], components: [buildWaitlistRow()] });
}

export async function handleButton(interaction) {
  const channelId = interaction.channel.id;

  if (interaction.customId === 'waitlist_join') {
    addToQueue(channelId, interaction.user.id);
  } else if (interaction.customId === 'waitlist_leave') {
    removeFromQueue(channelId, interaction.user.id);
  } else if (interaction.customId === 'waitlist_pingnext') {
    const next = advancePinged(channelId);
    if (next) await interaction.channel.send(`<@${next}> you're up! Head to the room.`);
  }

  const room = getRoom(channelId);
  await interaction.update({ embeds: [buildWaitlistEmbed(room)], components: [buildWaitlistRow()] });
}
