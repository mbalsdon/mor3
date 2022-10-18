import * as fs from 'fs'
import { EmbedBuilder } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function helpCmd (interaction) {
  console.info('::helpCmd()')
  const embed = new EmbedBuilder()
    .setColor(config.primaryColor)
    .setAuthor({ name: 'mor3 commands', iconURL: 'https://spreadnuts.s-ul.eu/MdfvA3q5', url: 'https://github.com/mbalsdon/mor3' })
    .setDescription('`help` - Documentation on the bot\'s commands\n' +
            '`ping` - Checks if the bot is alive\n' +
            '`metadata` - Displays mor3 sheet metadata\n' +
            '`users` - Displays list of tracked users, sorted by PP\n' +
            '`user` - Displays a user\'s stats\n' +
            '`track` - Adds a user to be tracked\n' +
            '`untrack` - Removes a user from being tracked\n' +
            '`tracklist` - Lists all tracked users in a .txt file\n' +
            '`submit` - Manually submits a score to the database\n' +
            '`unsubmit` - Removes a submitted score from the database\n' +
            '`scores` - Displays list of scores for a given mod combo, sorted by PP\n')
    .setFooter({ text: 'https://github.com/mbalsdon/mor3' })
  await interaction.reply({ embeds: [embed] })
}
