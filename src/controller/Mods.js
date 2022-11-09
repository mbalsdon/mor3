import Config from './Config.js'
import { InvalidModsError } from './Errors.js'
import Utils from './Utils.js'

export default class Mods {
  static SS = 'SS'
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

  static parseModKey (mods) {
    let pMods = mods
    if (!Utils.isString(pMods) && !Array.isArray(pMods)) throw new TypeError(`mods must be either a string or an array! Val=${mods}`)
    pMods = (Array.isArray(pMods)) ? pMods.join().replaceAll(',', '') : pMods
    pMods = pMods.replace('NC', Mods.DT)
    pMods = pMods.replace('NF', '')
    pMods = pMods.replace('SO', '')
    pMods = pMods.replace('SD', '')
    pMods = pMods.replace('PF', '')
    pMods = (pMods === '') ? Mods.NM : pMods
    pMods = (mods === 'SS') ? Mods.SS : pMods
    return pMods
  }

  static toSheetId (mods) {
    const pMods = this.parseModKey(mods)
    if (pMods === Mods.SS) return Config.SHEETS.SUBMITTED_SCORES.ID
    if (pMods === Mods.NM) return Config.SHEETS.NM.ID
    if (pMods === Mods.DT) return Config.SHEETS.DT.ID
    if (pMods === Mods.HR) return Config.SHEETS.HR.ID
    if (pMods === Mods.HD) return Config.SHEETS.HD.ID
    if (pMods === Mods.EZ) return Config.SHEETS.EZ.ID
    if (pMods === Mods.HT) return Config.SHEETS.HT.ID
    if (pMods === Mods.FL) return Config.SHEETS.FL.ID

    if (pMods === Mods.HDDT) return Config.SHEETS.HDDT.ID
    if (pMods === Mods.HRDT) return Config.SHEETS.HRDT.ID
    if (pMods === Mods.EZDT) return Config.SHEETS.EZDT.ID
    if (pMods === Mods.DTFL) return Config.SHEETS.DTFL.ID
    if (pMods === Mods.EZHT) return Config.SHEETS.EZHT.ID
    if (pMods === Mods.HDHR) return Config.SHEETS.HDHR.ID
    if (pMods === Mods.HDHT) return Config.SHEETS.HDHT.ID
    if (pMods === Mods.EZHD) return Config.SHEETS.EZHD.ID
    if (pMods === Mods.HRHT) return Config.SHEETS.HRHT.ID
    if (pMods === Mods.EZFL) return Config.SHEETS.EZFL.ID
    if (pMods === Mods.HRFL) return Config.SHEETS.HRFL.ID
    if (pMods === Mods.HTFL) return Config.SHEETS.HTFL.ID
    if (pMods === Mods.HDFL) return Config.SHEETS.HDFL.ID

    if (pMods === Mods.HDHRDT) return Config.SHEETS.HDHRDT.ID
    if (pMods === Mods.HDDTFL) return Config.SHEETS.HDDTFL.ID
    if (pMods === Mods.EZHDDT) return Config.SHEETS.EZHDDT.ID
    if (pMods === Mods.HRDTFL) return Config.SHEETS.HRDTFL.ID
    if (pMods === Mods.EZDTFL) return Config.SHEETS.EZDTFL.ID
    if (pMods === Mods.HDHTFL) return Config.SHEETS.HDHTFL.ID
    if (pMods === Mods.HDHRHT) return Config.SHEETS.HDHRHT.ID
    if (pMods === Mods.HRHTFL) return Config.SHEETS.HRHTFL.ID
    if (pMods === Mods.EZHDHT) return Config.SHEETS.EZHDHT.ID
    if (pMods === Mods.EZHTFL) return Config.SHEETS.EZHTFL.ID
    if (pMods === Mods.EZHDFL) return Config.SHEETS.EZHDFL.ID
    if (pMods === Mods.HDHRFL) return Config.SHEETS.HDHRFL.ID

    if (pMods === Mods.HDHRDTFL) return Config.SHEETS.HDHRDTFL.ID
    if (pMods === Mods.EZHDDTFL) return Config.SHEETS.EZHDDTFL.ID
    if (pMods === Mods.EZHDHTFL) return Config.SHEETS.EZHDHTFL.ID
    if (pMods === Mods.HDHRHTFL) return Config.SHEETS.HDHRHTFL.ID

    throw new InvalidModsError(`mods must be a valid mod string! Val=${mods}\n` +
                                `Valid mod strings: ${Mods.validModStrings().join(' ')}`)
  }

  //
  static toSheetName (mods) {
    const pMods = this.parseModKey(mods)
    if (pMods === Mods.SS) return Config.SHEETS.SUBMITTED_SCORES.NAME
    if (pMods === Mods.NM) return Config.SHEETS.NM.NAME
    if (pMods === Mods.DT) return Config.SHEETS.DT.NAME
    if (pMods === Mods.HR) return Config.SHEETS.HR.NAME
    if (pMods === Mods.HD) return Config.SHEETS.HD.NAME
    if (pMods === Mods.EZ) return Config.SHEETS.EZ.NAME
    if (pMods === Mods.HT) return Config.SHEETS.HT.NAME
    if (pMods === Mods.FL) return Config.SHEETS.FL.NAME

    if (pMods === Mods.HDDT) return Config.SHEETS.HDDT.NAME
    if (pMods === Mods.HRDT) return Config.SHEETS.HRDT.NAME
    if (pMods === Mods.EZDT) return Config.SHEETS.EZDT.NAME
    if (pMods === Mods.DTFL) return Config.SHEETS.DTFL.NAME
    if (pMods === Mods.EZHT) return Config.SHEETS.EZHT.NAME
    if (pMods === Mods.HDHR) return Config.SHEETS.HDHR.NAME
    if (pMods === Mods.HDHT) return Config.SHEETS.HDHT.NAME
    if (pMods === Mods.EZHD) return Config.SHEETS.EZHD.NAME
    if (pMods === Mods.HRHT) return Config.SHEETS.HRHT.NAME
    if (pMods === Mods.EZFL) return Config.SHEETS.EZFL.NAME
    if (pMods === Mods.HRFL) return Config.SHEETS.HRFL.NAME
    if (pMods === Mods.HTFL) return Config.SHEETS.HTFL.NAME
    if (pMods === Mods.HDFL) return Config.SHEETS.HDFL.NAME

    if (pMods === Mods.HDHRDT) return Config.SHEETS.HDHRDT.NAME
    if (pMods === Mods.HDDTFL) return Config.SHEETS.HDDTFL.NAME
    if (pMods === Mods.EZHDDT) return Config.SHEETS.EZHDDT.NAME
    if (pMods === Mods.HRDTFL) return Config.SHEETS.HRDTFL.NAME
    if (pMods === Mods.EZDTFL) return Config.SHEETS.EZDTFL.NAME
    if (pMods === Mods.HDHTFL) return Config.SHEETS.HDHTFL.NAME
    if (pMods === Mods.HDHRHT) return Config.SHEETS.HDHRHT.NAME
    if (pMods === Mods.HRHTFL) return Config.SHEETS.HRHTFL.NAME
    if (pMods === Mods.EZHDHT) return Config.SHEETS.EZHDHT.NAME
    if (pMods === Mods.EZHTFL) return Config.SHEETS.EZHTFL.NAME
    if (pMods === Mods.EZHDFL) return Config.SHEETS.EZHDFL.NAME
    if (pMods === Mods.HDHRFL) return Config.SHEETS.HDHRFL.NAME

    if (pMods === Mods.HDHRDTFL) return Config.SHEETS.HDHRDTFL.NAME
    if (pMods === Mods.EZHDDTFL) return Config.SHEETS.EZHDDTFL.NAME
    if (pMods === Mods.EZHDHTFL) return Config.SHEETS.EZHDHTFL.NAME
    if (pMods === Mods.HDHRHTFL) return Config.SHEETS.HDHRHTFL.NAME

    throw new InvalidModsError(`mods must be a valid mod string! Val=${mods}\n` +
                                `Valid mod strings: ${Mods.validModStrings().join(' ')}`)
  }
}
