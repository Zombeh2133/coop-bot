import { SlashCommandBuilder } from 'discord.js';
import { clearRoom } from '../state.js';
import { scheduleRename } from '../renameQueue.js';
import { parseRoomNumber } from '../roomName.js';

export const data = new SlashCommandBuilder().setName('boom').setDescription('Reset this room channel');

export async function execute(interaction) {
  const roomNumber = parseRoomNumber(interaction.channel.name);
  if (!roomNumber) {
    await interaction.reply({ content: 'This command only works inside a room channel (g1-g20).', ephemeral: true });
    return;
  }

  clearRoom(interaction.channel.id);
  scheduleRename(interaction.channel, () => `g${roomNumber}-xxxxx`);
  await interaction.reply('Room reset.');
}
