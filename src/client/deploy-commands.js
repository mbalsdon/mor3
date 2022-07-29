import 'dotenv/config'
import { REST } from '@discordjs/rest'
import { SlashCommandBuilder, Routes } from 'discord.js'

const token = process.env.DISCORD_API_BOT_TOKEN
const clientId = process.env.DISCORD_API_CLIENT_ID
const guildId = '941208827599151134'

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Checks if the bot is alive'),

  new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Stop copying me!')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('The message to echo back')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('metadata')
    .setDescription('Returns mor3 sheet metadata (WIP)'),

  new SlashCommandBuilder()
    .setName('users')
    .setDescription('Returns list of tracked users (WIP)')
    .addNumberOption(option => 
      option.setName('page')
        .setDescription('Page number of tracked user list')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('track')
    .setDescription('Adds a user for their top plays to be tracked (WIP)')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('The ID of the user to be tracked')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('untrack')
    .setDescription('Removes a user from being tracked (WIP)')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('The ID of the user to be tracked')
        .setRequired(true))

  // { ... }
]
  .map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(token)

rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)
