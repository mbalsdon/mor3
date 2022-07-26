import MorFacade from '../controller/MorFacade.js'

const facade = await MorFacade.build()
const response = await facade.scrapeUserTopPlays()
console.log(response)
