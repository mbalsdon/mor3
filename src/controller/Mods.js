import Utils from './Utils.js'

/**
 * Mods - Enumerates valid MOR mod strings and provides some useful functions for them
 */
export default class Mods {
  /**
   * Submitted Scores -
   * This is not an osu! mod but the MorFacade client uses it to interface with the Submitted Scores sheet
   */
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

  /**
   * Returns true if the input mod string is valid, false if not
   * @see {@link MorFacade.getSheetScores}
   * @param {string} modString MOR mod string
   * @return {boolean} whether the mod string is valid or not
   */
  static isValidModString (modString) {
    return Object.keys(Mods).includes(modString)
  }

  /**
   * Returns array of all valid MOR mod strings
   * @see {@link MorFacade.getSheetScores}
   * @return {string[]} array of valid mod strings
   */
  static validModStrings () {
    return Object.keys(Mods)
  }

  /**
   * Takes an array or string of osu! mods and returns the "normalized" form as a string.
   * That is, given an input of osu! mods, the function will return a valid MOR mod string.
   * @see {@link Mods.validModStrings}
   * @param {(string|string[])} mods osu! mods
   * @throws {@link TypeError} if parameters are invalid
   * @return {string} MOR mod string
   * @example
   *  // Prints 'HDDTNF' to stdout
   *  console.log(Mods.parseModKey(['HD', 'DT', 'NF']))
   *
   *  // Also prints 'HDDTNF' to stdout
   *  console.log(Mods.parseModKey('HDDTNF'))
   *
   *  // Prints 'NM' to stdout
   *  console.log(Mods.parseModKey('NFSO'))
   *
   *  // Prints 'HDDT' to stdout
   *  console.log(Mods.parseModKey('HDNC'))
   */
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
}
