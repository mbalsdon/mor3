import MorFacade from '../controller/MorFacade.js'

MorFacade.build()
  .then((facade) => {
    facade.scrapeUserTopPlays()
      .then((response) => {
        console.log(response)
      })
  })
