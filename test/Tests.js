const MorFacade = require('../src/controller/MorFacade')

MorFacade.build()
  .then((facade) => {
    facade.scrapeUserTopPlays()
  })