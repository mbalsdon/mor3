import 'dotenv/config'
import { REST } from '@discordjs/rest'
import { SlashCommandBuilder, Routes } from 'discord.js'

const token = process.env.DISCORD_API_BOT_TOKEN
const clientId = '1001153701299363861'
const guildId = '941208827599151134'

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Checks if the bot is alive'),
	new SlashCommandBuilder().setName('server').setDescription('Returns server information.'),
	new SlashCommandBuilder().setName('user').setDescription('Returns user information.'),
]
  .map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
