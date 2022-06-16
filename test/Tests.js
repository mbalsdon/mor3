import DriveWrapper from '../src/controller/DriveWrapper.js'
import MorFacade from '../src/controller/MorFacade.js'
import SheetsWrapper from '../src/controller/SheetsWrapper.js'

MorFacade.build()
  .then((facade) => {
    facade.scrapeUserTopPlays()
      .then((response) => {
        console.log(response)
      })
  })

// SheetsWrapper.build()
//   .then((sheets) => {
//     sheets.batchInsertScores('NM', [[1, 'a', 'a', 'NM', 1, 1, 'a'], [2, 'b', 'b', 'NM', 2, 2, 'b']])
//       .then((response) => {
//         console.log(response)
//       })
//   })

// DriveWrapper.build()
//   .then((drive) => {
//     drive.copyFile(process.env.SPREADSHEET_ID, 'asdf')
//       .then((response) => {
//         console.log(response)
//       })
//   })