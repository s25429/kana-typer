import { DEBUG } from './config.js'
import { Kana } from './kana.js'


export default async function(): Promise<void> {
    let errors = false

    await Kana.loadHiragana({
        asMap: true,
        groupsFilter: ['hiragana letters', 'small letters', 'combinable letters'],
        inputsFilter: ['-xa', '-xi', '-xu', '-xe', '-xo', '-xka', '-xke', '-xwa', '-wi', '-vu', '-we']
    })
    

    DEBUG && console.log('Hiragana:', Kana.HIRAGANA)

    return new Promise<void>((resolve, reject) => !errors ? resolve() : reject('Something went wrong in preload.js'))
}
