import Bot from './src/client/Bot.js'

const bot = await Bot.build()
await bot.start()
