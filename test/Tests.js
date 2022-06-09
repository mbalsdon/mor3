const MorFacade = require('../src/controller/MorFacade')
const SheetsWrapper = require('../src/controller/SheetsWrapper')

MorFacade.build()
  .then((facade) => {
    facade.scrapeUserTopPlays()
      .then((response) => {
        console.log()
      })
  })

// SheetsWrapper.build()
//   .then((sheets) => {
//     sheets.batchInsertScores('NM', [[1, 'a', 'a', 'NM', 1, 1, 'a'], [2, 'b', 'b', 'NM', 2, 2, 'b']])
//       .then((response) => {
//         console.log(response)
//       })
//   })