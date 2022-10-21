import * as fs from 'fs'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default class Mods {
  // TODO: enumerate mod combos

  // Array containing every possible mod string
  static modStrings = ['NM', 'DT', 'HR', 'HD', 'EZ', 'HT', 'FL',
    'HDDT', 'HRDT', 'EZDT', 'DTFL', 'EZHT', 'HDHR', 'HDHT', 'EZHD', 'HRHT', 'EZFL', 'HRFL', 'HTFL', 'HDFL',
    'HDHRDT', 'HDDTFL', 'EZHDDT', 'HRDTFL', 'EZDTFL', 'HDHTFL', 'HDHRHT', 'HRHTFL', 'EZHDHT', 'EZHTFL', 'EZHDFL', 'HDHRFL',
    'HDHRDTFL', 'EZHDDTFL', 'EZHDHTFL', 'HDHRHTFL']

  // Takes mods (array of str), returns "normalized form" as str (e.g. [HD,NC] => 'HDDT'; [NF] => 'NM')
  static parseModKey (mods) {
    // NC => DT
    if (mods.includes('NC')) mods.splice(mods.indexOf('NC'), 1, 'DT')
    // NF / SO / SD / PF => remove it
    if (mods.includes('NF')) mods.splice(mods.indexOf('NF'), 1)
    if (mods.includes('SO')) mods.splice(mods.indexOf('SO'), 1)
    if (mods.includes('SD')) mods.splice(mods.indexOf('SD'), 1)
    if (mods.includes('PF')) mods.splice(mods.indexOf('PF'), 1)
    // Empty => NM
    if (mods.length === 0) {
      return 'NM'
    } else {
      return mods.join().replaceAll(',', '')
    }
  }

  // Takes mods (str), returns normalized form
  static parseModKeyStr (mods) {
    let pMods = mods
    pMods = pMods.replace('NC', 'DT')
    pMods = pMods.replace('NF', '')
    pMods = pMods.replace('SO', '')
    pMods = pMods.replace('SD', '')
    pMods = pMods.replace('PF', '')
    pMods = (pMods === '') ? 'NM' : pMods
    return pMods
  }

  // Takes mod combination string, returns corresponding sheet ID. If input is invalid, returns -1.
  static toSheetId (mods) {
    const pMods = this.parseModKeyStr(mods)
    if (pMods === 'Submitted Scores') return config.SPREADSHEETS.SUBMITTED_SCORES_ID
    if (pMods === 'NM') return config.SPREADSHEETS.NM_ID
    if (pMods === 'DT') return config.SPREADSHEETS.DT_ID
    if (pMods === 'HR') return config.SPREADSHEETS.HR_ID
    if (pMods === 'HD') return config.SPREADSHEETS.HD_ID
    if (pMods === 'EZ') return config.SPREADSHEETS.EZ_ID
    if (pMods === 'HT') return config.SPREADSHEETS.HT_ID
    if (pMods === 'FL') return config.SPREADSHEETS.FL_ID

    if (pMods === 'HDDT') return config.SPREADSHEETS.HDDT_ID
    if (pMods === 'HRDT') return config.SPREADSHEETS.HRDT_ID
    if (pMods === 'EZDT') return config.SPREADSHEETS.EZDT_ID
    if (pMods === 'DTFL') return config.SPREADSHEETS.DTFL_ID
    if (pMods === 'EZHT') return config.SPREADSHEETS.EZHT_ID
    if (pMods === 'HDHR') return config.SPREADSHEETS.HDHR_ID
    if (pMods === 'HDHT') return config.SPREADSHEETS.HDHT_ID
    if (pMods === 'EZHD') return config.SPREADSHEETS.EZHD_ID
    if (pMods === 'HRHT') return config.SPREADSHEETS.HRHT_ID
    if (pMods === 'EZFL') return config.SPREADSHEETS.EZFL_ID
    if (pMods === 'HRFL') return config.SPREADSHEETS.HRFL_ID
    if (pMods === 'HTFL') return config.SPREADSHEETS.HTFL_ID
    if (pMods === 'HDFL') return config.SPREADSHEETS.HDFL_ID

    if (pMods === 'HDHRDT') return config.SPREADSHEETS.HDHRDT_ID
    if (pMods === 'HDDTFL') return config.SPREADSHEETS.HDDTFL_ID
    if (pMods === 'EZHDDT') return config.SPREADSHEETS.EZHDDT_ID
    if (pMods === 'HRDTFL') return config.SPREADSHEETS.HRDTFL_ID
    if (pMods === 'EZDTFL') return config.SPREADSHEETS.EZDTFL_ID
    if (pMods === 'HDHTFL') return config.SPREADSHEETS.HDHTFL_ID
    if (pMods === 'HDHRHT') return config.SPREADSHEETS.HDHRHT_ID
    if (pMods === 'HRHTFL') return config.SPREADSHEETS.HRHTFL_ID
    if (pMods === 'EZHDHT') return config.SPREADSHEETS.EZHDHT_ID
    if (pMods === 'EZHTFL') return config.SPREADSHEETS.EZHTFL_ID
    if (pMods === 'EZHDFL') return config.SPREADSHEETS.EZHDFL_ID
    if (pMods === 'HDHRFL') return config.SPREADSHEETS.HDHRFL_ID

    if (pMods === 'HDHRDTFL') return config.SPREADSHEETS.HDHRDTFL_ID
    if (pMods === 'EZHDDTFL') return config.SPREADSHEETS.EZHDDTFL_ID
    if (pMods === 'EZHDHTFL') return config.SPREADSHEETS.EZHDHTFL_ID
    if (pMods === 'HDHRHTFL') return config.SPREADSHEETS.HDHRHTFL_ID

    return -1
  }
}
