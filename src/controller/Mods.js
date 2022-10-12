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

  // Takes mod combination string, returns corresponding sheet ID. If input is invalid, returns -1.
  static toSheetId (mods) {
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
