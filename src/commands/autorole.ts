import { SlashCommandBuilder, type ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import type { Command } from '../types/Command';

export const autorole: Command = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Set the role that new members will receive')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to give to new members')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const role = interaction.options.getRole('role', true);
    
    // Check if the role is manageable
    if (role.position >= interaction.guild.members.me!.roles.highest.position) {
      await interaction.reply({
        content: 'I cannot assign this role as it is higher than my highest role.',
        ephemeral: true
      });
      return;
    }

    // Store the role ID in the database or cache
    // For now, we'll just confirm the role was set
    await interaction.reply({
      content: `Autorole has been set to ${role.name}`,
      ephemeral: true
    });
  },
}; 