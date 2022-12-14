/**
 * Basic setup script for the project
 * @example
 *  $ cd /path/to/mor3
 *  $ npm run setup
 */

import * as readline from 'readline'
import { promisify } from 'util'
import * as fs from 'fs'
import { google } from 'googleapis'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})
const question = promisify(rl.question).bind(rl)

console.log(
  '\n' +
  ('███╗   ███╗ ██████╗ ██████╗ ██████╗ \n') +
  ('████╗ ████║██╔═══██╗██╔══██╗╚════██╗\n') +
  ('██╔████╔██║██║   ██║██████╔╝ █████╔╝\n') +
  ('██║╚██╔╝██║██║   ██║██╔══██╗ ╚═══██╗\n') +
  ('██║ ╚═╝ ██║╚██████╔╝██║  ██║██████╔╝\n') +
  ('╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ \n')
)

console.log('Welcome to the MOR3 setup tool! This tool will configure your environment and get things working.\n')
console.log('If you have any issues or questions, DM spreadnuts#1566 on Discord or open an issue at https://github.com/mbalsdon/mor3.')
console.log('If you input any incorrect or outdated information, it can be manually edited by accessing mor_config.json, or by re-running the setup tool.\n')
await question('Press ENTER to continue.\n')

const NAME = await question('Please enter your Discord server\'s name (This doesn\'t have to be exact, it\'s just used to give the bot and spreadsheet a name): ')
const OSU_API_CLIENT_ID = await question('Please enter your osu! API Client ID: ')
const OSU_API_CLIENT_SECRET = await question('Please enter your osu! API Client Secret: ')
const DISCORD_API_CLIENT_ID = await question('Please enter your Discord API Client ID: ')
const DISCORD_API_BOT_TOKEN = await question('Please enter your Discord API Token: ')
const BACKUP_FOLDER_ID = await question('Please enter the ID of your Google Drive backup folder: ')

console.log('\nNOTE: If you haven\'t already, move your Google Cloud Service Account key into the root directory of this project, and make sure it\'s named gcp_key.json.')
await question('Press ENTER to continue.\n')

console.log('Copying blank MOR3 spreadsheet into your Drive folder...')
const GOOGLE_APPLICATION_CREDENTIALS = 'gcp_key.json'
const driveAuth = new google.auth.GoogleAuth({
  keyFile: GOOGLE_APPLICATION_CREDENTIALS,
  scopes: 'https://www.googleapis.com/auth/drive'
})
const authClient = await driveAuth.getClient()
const driveClient = google.drive({ version: 'v3', auth: authClient })
const fileData = await driveClient.files.copy({
  auth: driveAuth,
  fileId: '1upOqVKYGsD6g821t84ZqQusdv2cBkmyE1yWKUXY_fbA',
  resource: {
    name: NAME,
    parents: [BACKUP_FOLDER_ID]
  }
})

console.log('Success! You should now see a spreadsheet in your Google Drive backup folder.')
await question('Press ENTER to continue.\n')

console.log('Creating mor_config.json...')
const morConfig = {
  BOT_EMBED_COLOR: 16713190,
  LAST_UPDATE_CELL: 'B3',
  JOBS_CACHE: './src/jobs/cache',
  UPDATE_SCORES_CACHE: './src/jobs/cache/update_scores.json',
  OSU_API_COOLDOWN_MS: 500,
  GOOGLE_API_COOLDOWN_MS: 1200,
  SERVER_ICON_URL: 'https://spreadnuts.s-ul.eu/MdfvA3q5.png',
  NUM_PROCESSORS: 8,

  SHEETS: {
    SPREADSHEET: { ID: fileData.data.id, NAME: NAME },
    MAIN: { ID: '0', NAME: 'MAIN' },
    USERS: { ID: '287611481', NAME: 'USERS' },

    COMBINED: { ID: '142264271', NAME: 'COMBINED' },
    SUBMITTED: { ID: '526296193', NAME: 'SUBMITTED' },
    NM: { ID: '1045203346', NAME: 'NM' },
    DT: { ID: '1150213908', NAME: 'DT' },
    HR: { ID: '1602915539', NAME: 'HR' },
    HD: { ID: '1490982757', NAME: 'HD' },
    EZ: { ID: '1286747257', NAME: 'EZ' },
    HT: { ID: '566321154', NAME: 'HT' },
    FL: { ID: '1747794010', NAME: 'FL' },

    HDDT: { ID: '1135630071', NAME: 'HDDT' },
    HRDT: { ID: '1784025827', NAME: 'HRDT' },
    EZDT: { ID: '123006715', NAME: 'EZDT' },
    DTFL: { ID: '1235541135', NAME: 'DTFL' },
    EZHT: { ID: '1887704615', NAME: 'EZHT' },
    HDHR: { ID: '255036348', NAME: 'HDHR' },
    HDHT: { ID: '967178820', NAME: 'HDHT' },
    EZHD: { ID: '1942907608', NAME: 'EZHD' },
    HRHT: { ID: '1393786487', NAME: 'HRHT' },
    EZFL: { ID: '1703437188', NAME: 'EZFL' },
    HRFL: { ID: '1589439381', NAME: 'HRFL' },
    HTFL: { ID: '1763700573', NAME: 'HTFL' },
    HDFL: { ID: '689249361', NAME: 'HDFL' },

    HDHRDT: { ID: '521109209', NAME: 'HDHRDT' },
    HDDTFL: { ID: '933939195', NAME: 'HDDTFL' },
    EZHDDT: { ID: '1186950289', NAME: 'EZHDDT' },
    HRDTFL: { ID: '1043825170', NAME: 'HRDTFL' },
    EZDTFL: { ID: '1256987293', NAME: 'EZDTFL' },
    HDHTFL: { ID: '76289684', NAME: 'HDHTFL' },
    HDHRHT: { ID: '1555368926', NAME: 'HDHRHT' },
    HRHTFL: { ID: '269391550', NAME: 'HRHTFL' },
    EZHDHT: { ID: '768017335', NAME: 'EZHDHT' },
    EZHTFL: { ID: '1875923114', NAME: 'EZHTFL' },
    EZHDFL: { ID: '2026945163', NAME: 'EZHDFL' },
    HDHRFL: { ID: '829510119', NAME: 'HDHRFL' },


    HDHRDTFL: { ID: '166217439', NAME: 'HDHRDTFL' },
    EZHDDTFL: { ID: '391707125', NAME: 'EZHDDTFL' },
    EZHDHTFL: { ID: '1411853977', NAME: 'EZHDHTFL' },
    HDHRHTFL: { ID: '242518715', NAME: 'HDHRHTFL' }
  },

  DRIVE: {
    BACKUP_FOLDER_ID: BACKUP_FOLDER_ID
  },

  OSU_API_CLIENT_ID: OSU_API_CLIENT_ID,
  OSU_API_CLIENT_SECRET: OSU_API_CLIENT_SECRET,
  GOOGLE_APPLICATION_CREDENTIALS: GOOGLE_APPLICATION_CREDENTIALS,
  DISCORD_API_CLIENT_ID: DISCORD_API_CLIENT_ID,
  DISCORD_API_BOT_TOKEN: DISCORD_API_BOT_TOKEN
}
fs.writeFileSync('./mor_config.json', JSON.stringify(morConfig))
console.log('Done!\n')

console.log('😎 Setup complete! There are a few more configuration settings that have been set with default values. If you wish to change them, their values can be found and edited in mor_config.json, located in the root directory of this project.')
console.log(`You can invite the bot to your server with the following link: https://discord.com/api/oauth2/authorize?client_id=${DISCORD_API_CLIENT_ID}&permissions=35840&scope=bot%20applications.commands`)
console.log('Run the command \'npm run start\' to start the bot.')

rl.close()
