import MorFacade from '../controller/MorFacade'

MorFacade.build()
  .then((facade) => {
    facade.scrapeUserTopPlays()
      .then((response) => {
        console.log(response)
      })
  })