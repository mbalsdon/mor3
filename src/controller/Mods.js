import * as fs from 'fs'
import { InvalidModsError } from './Errors.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default class Mods {
  static SS = 'Submitted Scores'
  static NM = 'NM'
  static DT = 'DT'
  static HR = 'HR'
  static HD = 'HD'
  static EZ = 'EZ'
  static HT = 'HT'
  static FL = 'FL'

  static HDDT = 'HDDT'
  static HRDT = 'HRDT'
  static EZDT = 'EZDT'
  static DTFL = 'DTFL'
  static EZHT = 'EZHT'
  static HDHR = 'HDHR'
  static HDHT = 'HDHT'
  static EZHD = 'EZHD'
  static HRHT = 'HRHT'
  static EZFL = 'EZFL'
  static HRFL = 'HRFL'
  static HTFL = 'HTFL'
  static HDFL = 'HDFL'

  static HDHRDT = 'HDHRDT'
  static HDDTFL = 'HDDTFL'
  static EZHDDT = 'EZHDDT'
  static HRDTFL = 'HRDTFL'
  static EZDTFL = 'EZDTFL'
  static HDHTFL = 'HDHTFL'
  static HDHRHT = 'HDHRHT'
  static HRHTFL = 'HRHTFL'
  static EZHDHT = 'EZHDHT'
  static EZHTFL = 'EZHTFL'
  static EZHDFL = 'EZHDFL'
  static HDHRFL = 'HDHRFL'

  static HDHRDTFL = 'HDHRDTFL'
  static EZHDDTFL = 'EZHDDTFL'
  static EZHDHTFL = 'EZHDHTFL'
  static HDHRHTFL = 'HDHRHTFL'

  static isValidModString (ms) {
    return Object.keys(Mods).includes(ms)
  }

  static validModStrings () {
    return Object.keys(Mods)
  }

  // Takes mods (array of str), returns "normalized form" as str (e.g. [HD,NC] => 'HDDT'; [NF] => 'NM')
  static parseModKey (mods) {
    // NC => DT
    if (mods.includes('NC')) mods.splice(mods.indexOf('NC'), 1, Mods.DT)
    // NF / SO / SD / PF => remove it
    if (mods.includes('NF')) mods.splice(mods.indexOf('NF'), 1)
    if (mods.includes('SO')) mods.splice(mods.indexOf('SO'), 1)
    if (mods.includes('SD')) mods.splice(mods.indexOf('SD'), 1)
    if (mods.includes('PF')) mods.splice(mods.indexOf('PF'), 1)
    // Empty => NM
    if (mods.length === 0) {
      return Mods.NM
    } else {
      return mods.join().replaceAll(',', '')
    }
  }

  // Takes mods (str), returns normalized form
  static parseModKeyStr (mods) {
    let pMods = mods
    pMods = pMods.replace('NC', Mods.DT)
    pMods = pMods.replace('NF', '')
    pMods = pMods.replace('SO', '')
    pMods = pMods.replace('SD', '')
    pMods = pMods.replace('PF', '')
    pMods = (pMods === '') ? Mods.NM : pMods
    return pMods
  }

  // Takes mod combination string, returns corresponding sheet ID. If input is invalid, returns -1.
  static toSheetId (mods) {
    const pMods = this.parseModKeyStr(mods)
    if (pMods === Mods.SS) return config.SPREADSHEETS.SUBMITTED_SCORES_ID
    if (pMods === Mods.NM) return config.SPREADSHEETS.NM_ID
    if (pMods === Mods.DT) return config.SPREADSHEETS.DT_ID
    if (pMods === Mods.HR) return config.SPREADSHEETS.HR_ID
    if (pMods === Mods.HD) return config.SPREADSHEETS.HD_ID
    if (pMods === Mods.EZ) return config.SPREADSHEETS.EZ_ID
    if (pMods === Mods.HT) return config.SPREADSHEETS.HT_ID
    if (pMods === Mods.FL) return config.SPREADSHEETS.FL_ID

    if (pMods === Mods.HDDT) return config.SPREADSHEETS.HDDT_ID
    if (pMods === Mods.HRDT) return config.SPREADSHEETS.HRDT_ID
    if (pMods === Mods.EZDT) return config.SPREADSHEETS.EZDT_ID
    if (pMods === Mods.DTFL) return config.SPREADSHEETS.DTFL_ID
    if (pMods === Mods.EZHT) return config.SPREADSHEETS.EZHT_ID
    if (pMods === Mods.HDHR) return config.SPREADSHEETS.HDHR_ID
    if (pMods === Mods.HDHT) return config.SPREADSHEETS.HDHT_ID
    if (pMods === Mods.EZHD) return config.SPREADSHEETS.EZHD_ID
    if (pMods === Mods.HRHT) return config.SPREADSHEETS.HRHT_ID
    if (pMods === Mods.EZFL) return config.SPREADSHEETS.EZFL_ID
    if (pMods === Mods.HRFL) return config.SPREADSHEETS.HRFL_ID
    if (pMods === Mods.HTFL) return config.SPREADSHEETS.HTFL_ID
    if (pMods === Mods.HDFL) return config.SPREADSHEETS.HDFL_ID

    if (pMods === Mods.HDHRDT) return config.SPREADSHEETS.HDHRDT_ID
    if (pMods === Mods.HDDTFL) return config.SPREADSHEETS.HDDTFL_ID
    if (pMods === Mods.EZHDDT) return config.SPREADSHEETS.EZHDDT_ID
    if (pMods === Mods.HRDTFL) return config.SPREADSHEETS.HRDTFL_ID
    if (pMods === Mods.EZDTFL) return config.SPREADSHEETS.EZDTFL_ID
    if (pMods === Mods.HDHTFL) return config.SPREADSHEETS.HDHTFL_ID
    if (pMods === Mods.HDHRHT) return config.SPREADSHEETS.HDHRHT_ID
    if (pMods === Mods.HRHTFL) return config.SPREADSHEETS.HRHTFL_ID
    if (pMods === Mods.EZHDHT) return config.SPREADSHEETS.EZHDHT_ID
    if (pMods === Mods.EZHTFL) return config.SPREADSHEETS.EZHTFL_ID
    if (pMods === Mods.EZHDFL) return config.SPREADSHEETS.EZHDFL_ID
    if (pMods === Mods.HDHRFL) return config.SPREADSHEETS.HDHRFL_ID

    if (pMods === Mods.HDHRDTFL) return config.SPREADSHEETS.HDHRDTFL_ID
    if (pMods === Mods.EZHDDTFL) return config.SPREADSHEETS.EZHDDTFL_ID
    if (pMods === Mods.EZHDHTFL) return config.SPREADSHEETS.EZHDHTFL_ID
    if (pMods === Mods.HDHRHTFL) return config.SPREADSHEETS.HDHRHTFL_ID

    throw new InvalidModsError(`mods must be a valid mod string! mods = ${mods}\n` +
                                `Valid mod strings: ${Mods.validModStrings().join(' ')}`)
  }
}
