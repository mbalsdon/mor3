/* TODO: If other people are to use this code, spreadsheet IDs must be custom populated;
  Maybe write a script to automatically enter them down the line
*/

require('dotenv').config()

// Enumerates all possible mod combinations and associated spreadsheet IDs
// Usage: Object.keys(Mods).includes(str)

module.exports = class Mods {

  // Takes mod combination string, returns corresponding sheet ID. If input is invalid, returns -1.
  static toSheetId(mods) {
    if (mods === 'NM') return process.env.NM
    if (mods === 'DT') return process.env.DT
    if (mods === 'HR') return process.env.HR
    if (mods === 'HD') return process.env.HD
    if (mods === 'EZ') return process.env.EZ
    if (mods === 'HT') return process.env.HT
    if (mods === 'FL') return process.env.FL

    if (mods === 'HDDT') return process.env.HDDT
    if (mods === 'HRDT') return process.env.HRDT
    if (mods === 'EZDT') return process.env.EZDT
    if (mods === 'DTFL') return process.env.DTFL
    if (mods === 'EZHT') return process.env.EZHT
    if (mods === 'HDHR') return process.env.HDHR
    if (mods === 'HDHT') return process.env.HDHT
    if (mods === 'EZHD') return process.env.EZHD
    if (mods === 'HRHT') return process.env.HRHT
    if (mods === 'EZFL') return process.env.EZFL
    if (mods === 'HRFL') return process.env.HRFL
    if (mods === 'HTFL') return process.env.HTFL
    if (mods === 'HDFL') return process.env.HDFL

    if (mods === 'HDHRDT') return process.env.HDHRDT
    if (mods === 'HDDTFL') return process.env.HDDTFL
    if (mods === 'EZHDDT') return process.env.EZHDDT
    if (mods === 'HRDTFL') return process.env.HRDTFL
    if (mods === 'EZDTFL') return process.env.EZDTFL
    if (mods === 'HDHTFL') return process.env.HDHTFL
    if (mods === 'HDHRHT') return process.env.HDHRHT
    if (mods === 'HRHTFL') return process.env.HRHTFL
    if (mods === 'EZHDHT') return process.env.EZHDHT
    if (mods === 'EZHTFL') return process.env.EZHTFL
    if (mods === 'EZHDFL') return process.env.EZHDFL
    if (mods === 'HDHRFL') return process.env.HDHRFL
    
    if (mods === 'HDHRDTFL') return process.env.HDHRDTFL
    if (mods === 'EZHDDTFL') return process.env.EZHDDTFL
    if (mods === 'EZHDHTFL') return process.env.EZHDHTFL
    if (mods === 'HDHRHTFL') return process.env.HDHRHTFL

    return -1
  }
}
