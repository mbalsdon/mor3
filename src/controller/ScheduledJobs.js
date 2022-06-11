const cron = require('node-cron')
const MorFacade = require('./MorFacade')

exports.initScheduledJobs = () => {
  const scheduledJobFunction = cron.schedule('0 */24 * * *', () => {
    MorFacade.build()
      .then((facade) => {
        facade.scrapeUserTopPlays()
          .then((response) => {
            console.log(response)
          })
      })
  })

  scheduledJobFunction.start()
}
