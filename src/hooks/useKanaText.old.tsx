import { useState } from 'react'
import Charmap from '../data/charmap.json'
import Unicode from '../data/unicode.json'


export type JSONValue = 
    | string
    | number
    | boolean
    | null
    | JSON[]
    | { [key: string]: JSON }

export type JSO<K extends keyof any, T> = {
    [key in K]: T
}

export type KanaData = {
    description : string, 
    group       : string, 
    inputs      : string[], 
    combination : string[], 
}

type KanaFilterMode = 'include' | 'exclude'

interface KanaFilter {
    mode: KanaFilterMode,
    hiragana?: string[], 
    katakana?: string[], 
    kanji?: string[], 
}



export default function useKanaText(config: KanaFilter = { mode: 'exclude' }) {
    const [kana, setKana] = useState('')

    // TODO: No idea what is going on here with hiraganaUnicodes. Probably due to module-like import of json and typescript static-ness
    const hiraganaCharmap: string[] = Charmap.hiragana
    const hiraganaUnicodes: JSO<string, KanaData> = JSON.parse(JSON.stringify(Unicode.hiragana))
    const hiraganaCodemap = (() => {
        // TODO: refactor
        const map: JSO<string, string> = {}

        for (const [key, data] of Object.entries(hiraganaUnicodes)) {
            if (!['small letters', 'hiragana letters', 'combinable letters'].includes(data.group))
                continue

            data.inputs.forEach((input) => {
                map[input] = key
            })
        }

        return map
    })()

    const generateKana = () => {
        // Fill with code that enables filtering of loaded json charmap
        let hiragana = ''

        switch (config.mode) {
            case 'exclude': {

            } break

            case 'include': {

            } break

            default: {

            }
        }

        for (let i = 0; i < 20; i++) {
            let rand = Math.floor(Math.random() * hiraganaCharmap.length)
            let text = hiraganaCharmap[rand]
            let code = hiraganaCodemap[text] || '25a1'
            let char = String.fromCodePoint(parseInt(code, 16))
            console.debug(`rand=${rand}, text=${text}, code=${code}, char=${char}`)
            hiragana += char
        }

        setKana(hiragana)
    }

    return [kana, generateKana] as const
}
