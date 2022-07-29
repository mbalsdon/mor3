import 'dotenv/config'
import { REST } from '@discordjs/rest'
import { SlashCommandBuilder, Routes, PermissionFlagsBits } from 'discord.js'

const token = process.env.DISCORD_API_BOT_TOKEN
const clientId = process.env.DISCORD_API_CLIENT_ID
const moderatorPermFlags = PermissionFlagsBits.ModerateMembers
const userPermFlags = PermissionFlagsBits.SendMessages

const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Documents all of the bot commands (WIP)')
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),
  
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Checks if the bot is alive')
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('metadata')
    .setDescription('Returns mor3 sheet metadata (WIP)')
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('users')
    .setDescription('Displays list of tracked users sorted by PP')
    .addNumberOption(option => 
      option.setName('page')
        .setDescription('Page number of tracked user list')
        .setRequired(true))
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('track')
    .setDescription('Adds a user to be tracked')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('The ID of the user to be tracked')
        .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(moderatorPermFlags),

  new SlashCommandBuilder()
    .setName('untrack')
    .setDescription('Removes a user from being tracked')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('The ID of the user to be tracked')
        .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(moderatorPermFlags),

  new SlashCommandBuilder()
    .setName('trackcommands')
    .setDescription('Lists all tracked users, formatted for owobot and Bathbot')
    .setDMPermission(false)
    .setDefaultMemberPermissions(userPermFlags)

  // { ... }
]
  .map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(token)

rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)
