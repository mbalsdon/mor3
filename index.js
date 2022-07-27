import Bot from './src/client/Bot.js'

const client = await Bot.build()
await client.start()
