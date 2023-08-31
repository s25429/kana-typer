import { DEBUG } from './config.js'
import { Kana, KeyManager } from './kana.js'


export default async function(): Promise<void> {
    let errors = false

    await Kana.loadHiragana({
        asMap: true,
        groupsFilter: ['hiragana letters', 'small letters', 'combinable letters'],
        inputsFilter: ['-xa', '-xi', '-xu', '-xe', '-xo', '-xka', '-xke', '-xwa', '-wi', '-vu', '-we']
    })

    KeyManager
        .addKey('non-function-keys', (event) => event.key.length < 2)
        .addKey('bs', (event) => event.code === KeyManager.key.BACKSPACE)
        .addKey('dl', (event) => event.code === KeyManager.key.DELETE)
        .addKey('ctrl+c', (event) => event.code === KeyManager.key.C && event.ctrlKey)
        .addKey('ctrl+v', (event) => event.code === KeyManager.key.V && event.ctrlKey)

    DEBUG && console.debug('Hiragana:', Kana.HIRAGANA)

    return new Promise<void>((resolve, reject) => !errors ? resolve() : reject('Something went wrong in preload.js'))
}
