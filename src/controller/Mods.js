import MorConfig from './MorConfig.js'
import MorUtils from './MorUtils.js'

/** Enumerates valid MOR mod strings and provides some useful functions for them */
export default class Mods {
  /** Combined Scores - This is not an osu! mod but the MorFacade client uses it to interface with the Combined Scores sheet */
  static COMBINED = MorConfig.SHEETS.COMBINED.NAME
  /** Submitted Scores - This is not an osu! mod but the MorFacade client uses it to interface with the Submitted Scores sheet */
  static SUBMITTED = MorConfig.SHEETS.SUBMITTED.NAME

  static NM = MorConfig.SHEETS.NM.NAME
  static DT = MorConfig.SHEETS.DT.NAME
  static HR = MorConfig.SHEETS.HR.NAME
  static HD = MorConfig.SHEETS.HD.NAME
  static EZ = MorConfig.SHEETS.EZ.NAME
  static HT = MorConfig.SHEETS.HT.NAME
  static FL = MorConfig.SHEETS.FL.NAME

  static HDDT = MorConfig.SHEETS.HDDT.NAME
  static HRDT = MorConfig.SHEETS.HRDT.NAME
  static EZDT = MorConfig.SHEETS.EZDT.NAME
  static DTFL = MorConfig.SHEETS.DTFL.NAME
  static EZHT = MorConfig.SHEETS.EZHT.NAME
  static HDHR = MorConfig.SHEETS.HDHR.NAME
  static HDHT = MorConfig.SHEETS.HDHT.NAME
  static EZHD = MorConfig.SHEETS.EZHD.NAME
  static HRHT = MorConfig.SHEETS.HRHT.NAME
  static EZFL = MorConfig.SHEETS.EZFL.NAME
  static HRFL = MorConfig.SHEETS.HRFL.NAME
  static HTFL = MorConfig.SHEETS.HTFL.NAME
  static HDFL = MorConfig.SHEETS.HDFL.NAME

  static HDHRDT = MorConfig.SHEETS.HDHRDT.NAME
  static HDDTFL = MorConfig.SHEETS.HDDTFL.NAME
  static EZHDDT = MorConfig.SHEETS.EZHDDT.NAME
  static HRDTFL = MorConfig.SHEETS.HRDTFL.NAME
  static EZDTFL = MorConfig.SHEETS.EZDTFL.NAME
  static HDHTFL = MorConfig.SHEETS.HDHTFL.NAME
  static HDHRHT = MorConfig.SHEETS.HDHRHT.NAME
  static HRHTFL = MorConfig.SHEETS.HRHTFL.NAME
  static EZHDHT = MorConfig.SHEETS.EZHDHT.NAME
  static EZHTFL = MorConfig.SHEETS.EZHTFL.NAME
  static EZHDFL = MorConfig.SHEETS.EZHDFL.NAME
  static HDHRFL = MorConfig.SHEETS.HDHRFL.NAME

  static HDHRDTFL = MorConfig.SHEETS.HDHRDTFL.NAME
  static EZHDDTFL = MorConfig.SHEETS.EZHDDTFL.NAME
  static EZHDHTFL = MorConfig.SHEETS.EZHDHTFL.NAME
  static HDHRHTFL = MorConfig.SHEETS.HDHRHTFL.NAME

  /**
     * Returns array of all valid MOR mod strings
     * @return {string[]} array of valid mod strings
     */
  static validModStrings () {
    return Object.keys(Mods)
  }

  /**
   * Returns true if the input mod string is valid, false if not
   * @param {string} modString MOR mod string
   * @return {boolean} whether the mod string is valid or not
   */
  static isValidModString (modString) {
    return Object.keys(Mods).includes(modString)
  }

  static isValidModArray (modArray) {
    if (modArray.length === 0) return true
    else return (MorUtils.isStringArray(modArray) && modArray.every(m => Mods.isValidModString(m)))
  }

  /**
   * Returns true if the input mod string affects SR, false if not
   * @param {string} modString MOR mod string
   * @return {boolean} whether the mod string affects SR or not
   */
  static affectsStarRating (modString) {
    return (modString.includes(Mods.DT) ||
            modString.includes(Mods.HR) ||
            modString.includes(Mods.EZ) ||
            modString.includes(Mods.HT) ||
            modString.includes(Mods.FL))
  }

  /**
   * Returns array form of input mod string
   * @param {string} modString MOR mod string
   * @return {string[]} array of mods
   */
  static toArray (modString) {
    if (modString === Mods.NM) return []
    else return modString.match(/.{1,2}/g)
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
    if (!MorUtils.isString(pMods) && !Array.isArray(pMods)) throw new TypeError(`mods must be either a string or an array! Val=${mods}`)
    pMods = (Array.isArray(pMods)) ? pMods.join().replaceAll(',', '') : pMods
    pMods = pMods.replace('NC', Mods.DT)
    pMods = pMods.replace('NF', '')
    pMods = pMods.replace('SO', '')
    pMods = pMods.replace('SD', '')
    pMods = pMods.replace('PF', '')
    pMods = (pMods === '') ? Mods.NM : pMods
    return pMods
  }
}
