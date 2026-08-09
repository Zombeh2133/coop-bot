import { SlashCommandBuilder } from 'discord.js';
import { getRoom, setCode, updateNeeded, clearRoom } from '../state.js';
import { scheduleRename } from '../renameQueue.js';

const MAX_NEEDED = 4;
const ROOM_NAME_PATTERN = /^g(\d+)-/;

function parseRoomNumber(channelName) {
  const match = channelName.match(ROOM_NAME_PATTERN);
  return match ? match[1] : null;
}

function buildChannelName(roomNumber, code, needed) {
  if (!code) return `g${roomNumber}-xxxxx`;
  if (needed <= 0) return `g${roomNumber}-${code}-f`;
  return `g${roomNumber}-${code}`;
}

export const data = new SlashCommandBuilder()
  .setName('room')
  .setDescription('Manage this co-op room channel')
  .addSubcommand((sub) =>
    sub
      .setName('set')
      .setDescription('Set the in-game room code for this channel')
      .addStringOption((opt) => opt.setName('code').setDescription('The in-game room code').setRequired(true)),
  )
  .addSubcommand((sub) => sub.setName('join').setDescription('Mark that someone joined this room'))
  .addSubcommand((sub) => sub.setName('leave').setDescription('Mark that someone left this room, opening a slot'))
  .addSubcommand((sub) => sub.setName('boom').setDescription('Reset this room channel'));

export async function execute(interaction) {
  const roomNumber = parseRoomNumber(interaction.channel.name);
  if (!roomNumber) {
    await interaction.reply({ content: 'This command only works inside a room channel (g1-g20).', ephemeral: true });
    return;
  }

  const sub = interaction.options.getSubcommand();

  if (sub === 'set') {
    const code = interaction.options.getString('code');
    setCode(interaction.channel.id, code, MAX_NEEDED);
    scheduleRename(interaction.channel, () => {
      const room = getRoom(interaction.channel.id);
      return buildChannelName(roomNumber, room.code, room.needed);
    });
    await interaction.reply(`Room code set to **${code}**. Needs ${MAX_NEEDED} more to fill.`);
    return;
  }

  const room = getRoom(interaction.channel.id);
  if (!room.code) {
    await interaction.reply({ content: 'No room code has been set yet — use `/room set` first.', ephemeral: true });
    return;
  }

  if (sub === 'join') {
    const needed = Math.max(0, room.needed - 1);
    updateNeeded(interaction.channel.id, needed);
    scheduleRename(interaction.channel, () => {
      const fresh = getRoom(interaction.channel.id);
      return buildChannelName(roomNumber, fresh.code, fresh.needed);
    });
    await interaction.reply(needed === 0 ? 'Room is now full!' : `Joined — ${needed} more slot(s) needed.`);
    return;
  }

  if (sub === 'leave') {
    const needed = Math.min(MAX_NEEDED, room.needed + 1);
    updateNeeded(interaction.channel.id, needed);
    scheduleRename(interaction.channel, () => {
      const fresh = getRoom(interaction.channel.id);
      return buildChannelName(roomNumber, fresh.code, fresh.needed);
    });
    await interaction.reply(`A slot opened up — ${needed} more needed.`);
    return;
  }

  if (sub === 'boom') {
    clearRoom(interaction.channel.id);
    scheduleRename(interaction.channel, () => `g${roomNumber}-xxxxx`);
    await interaction.reply('Room reset.');
    return;
  }
}
