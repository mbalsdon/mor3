import 'dotenv/config'
import { Client, GatewayIntentBits } from 'discord.js';
import MorFacade from './src/controller/MorFacade.js';

const facade = await MorFacade.build()
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
	console.log('MOR3 is online!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('pong!');
	} else if (commandName === 'echo') {
		const input = interaction.options.getString('input')
		await interaction.reply(input)
	} else if (commandName === 'metadata') {
		const metadata = await facade.getMetadata()
		await interaction.reply(JSON.stringify(metadata))
	}
});

// Must be the last line of code
client.login(process.env.DISCORD_API_BOT_TOKEN)
