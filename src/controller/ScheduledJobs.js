import cron from 'node-cron'
import MorFacade from './MorFacade.js'

export function initScheduledJobs () {
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
