/* TODO: If other people are to use this code, spreadsheet IDs must be custom populated;
  Maybe write a script to automatically create sheets, get their IDs, populate .env, etc.
*/

import 'dotenv/config'

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
    if (pMods === 'Submitted Scores') return process.env.SUBMITTED_SCORES
    if (pMods === 'NM') return process.env.NM
    if (pMods === 'DT') return process.env.DT
    if (pMods === 'HR') return process.env.HR
    if (pMods === 'HD') return process.env.HD
    if (pMods === 'EZ') return process.env.EZ
    if (pMods === 'HT') return process.env.HT
    if (pMods === 'FL') return process.env.FL

    if (pMods === 'HDDT') return process.env.HDDT
    if (pMods === 'HRDT') return process.env.HRDT
    if (pMods === 'EZDT') return process.env.EZDT
    if (pMods === 'DTFL') return process.env.DTFL
    if (pMods === 'EZHT') return process.env.EZHT
    if (pMods === 'HDHR') return process.env.HDHR
    if (pMods === 'HDHT') return process.env.HDHT
    if (pMods === 'EZHD') return process.env.EZHD
    if (pMods === 'HRHT') return process.env.HRHT
    if (pMods === 'EZFL') return process.env.EZFL
    if (pMods === 'HRFL') return process.env.HRFL
    if (pMods === 'HTFL') return process.env.HTFL
    if (pMods === 'HDFL') return process.env.HDFL

    if (pMods === 'HDHRDT') return process.env.HDHRDT
    if (pMods === 'HDDTFL') return process.env.HDDTFL
    if (pMods === 'EZHDDT') return process.env.EZHDDT
    if (pMods === 'HRDTFL') return process.env.HRDTFL
    if (pMods === 'EZDTFL') return process.env.EZDTFL
    if (pMods === 'HDHTFL') return process.env.HDHTFL
    if (pMods === 'HDHRHT') return process.env.HDHRHT
    if (pMods === 'HRHTFL') return process.env.HRHTFL
    if (pMods === 'EZHDHT') return process.env.EZHDHT
    if (pMods === 'EZHTFL') return process.env.EZHTFL
    if (pMods === 'EZHDFL') return process.env.EZHDFL
    if (pMods === 'HDHRFL') return process.env.HDHRFL

    if (pMods === 'HDHRDTFL') return process.env.HDHRDTFL
    if (pMods === 'EZHDDTFL') return process.env.EZHDDTFL
    if (pMods === 'EZHDHTFL') return process.env.EZHDHTFL
    if (pMods === 'HDHRHTFL') return process.env.HDHRHTFL

    return -1
  }
}
