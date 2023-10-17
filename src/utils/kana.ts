import { loadJson } from "./json"
import { JSONValue } from "./types"


const HIRAGANA = 'hiragana'
const KATAKANA = 'katakana'
const KANJI = 'kanji'
const ALL = 'all'


type KanaOptions = (typeof HIRAGANA | typeof KATAKANA | typeof KANJI)[]
type Unicode = string


interface RomajiMapFilter {
    hiragana?: string[] | typeof ALL
    katakana?: string[] | typeof ALL
    kanji?: string[] | typeof ALL
}



namespace Kana {
    export interface UnicodeMap {
        [key: Unicode]: {
            description: string
            groups: string[]
            inputs: string[]
            combinations: string[]
        }
    }
    
    export interface InputMap {
        [key: string]: Unicode
    }
    
    export interface Maps {
        romaji: string[]
        unicode: UnicodeMap
        input: InputMap
    }
}

interface Kana<T> {
    hiragana: T
    katakana: T
    kanji: T
}




const kanaData: Kana<Kana.Maps> = {
    hiragana: { romaji: [], unicode: {}, input: {} },
    katakana: { romaji: [], unicode: {}, input: {} },
    kanji: { romaji: [], unicode: {}, input: {} },
}

const parseRomajiMap = (
    parsedJson: any | 'hint:JSONValue', // TODO: fix this
    filter: RomajiMapFilter = { hiragana: ALL }
): Kana<string[]> => {
    // TODO: Implement filtering, e.g. { hiragana: ['group1', '-group2'] }  ===  // include only group1 and exclude only group2, so excluding does not need to happen
    // TODO: empty list means import nothing, list with groups is depicted above and list === 'all' means import everything
    // TODO: excluding whole group can be either typed as { katakana: [] } or simply object without this property

    let ret: Kana<string[]> = {
        hiragana: [],
        katakana: [],
        kanji: [],
    }

    if (filter?.hiragana === ALL) {
        const hiragana: string[] = [
            ...parsedJson.hiragana.gojuuon, 
            ...parsedJson.hiragana.dakuten,
            ...parsedJson.hiragana.youon,
            ...parsedJson.hiragana.youonDakuten,
        ]

        ret = { ...ret, hiragana }

        // RomajiMap.hiragana.all.forEach((property: string) => {
        //     hiragana = [ ...hiragana, RomajiMap.hiragana[property] ]  // TODO: does not work
        // })
    }

    if (filter?.katakana === ALL) {
        console.warn('loadRomajiMapJson: katakana=all - Not implemented')
    }

    if (filter?.kanji === ALL) {
        console.warn('loadRomajiMapJson: kanji=all - Not implemented')
    }

    return ret
}

const parseUnicodeMap = (
    parsedJson: any | 'hint:JSONValue', // TODO: fix this
    kanas: KanaOptions = ['hiragana']
): Kana<Kana.UnicodeMap> => {
    let ret: Kana<Kana.UnicodeMap> = {
        hiragana: {},
        katakana: {},
        kanji: {},
    }

    if (kanas.includes(HIRAGANA)) {
        ret = { ...ret, hiragana: parsedJson.hiragana }
    }

    return ret
}

const parseInputMap = (
    parsedJson: any | 'hint:JSONValue', // TODO: fix this
    kanas: KanaOptions = ['hiragana']
): Kana<Kana.InputMap> => {
    let ret: Kana<Kana.InputMap> = {
        hiragana: {},
        katakana: {},
        kanji: {},
    }

    if (kanas.includes(HIRAGANA)) {
        let hiragana: { [key: string]: Unicode } = {}

        Object.entries(parsedJson.hiragana).map(([code, data]: [Unicode, any]) => (
            data.inputs.length === 0 || data.inputs.forEach((input: string) => {
                hiragana = { ...hiragana, [input]: code }
            })
        ))

        ret = { ...ret, hiragana }
    }

    return ret
}

const loadKanaFromJson = () => {
    const romajiRaw: JSONValue = loadJson('romaji')
    const unicodeRaw: JSONValue = loadJson('unicode')

    const romajiMap: Kana<string[]> = parseRomajiMap(romajiRaw)
    const unicodeMap: Kana<Kana.UnicodeMap> = parseUnicodeMap(unicodeRaw)
    const inputMap: Kana<Kana.InputMap> = parseInputMap(unicodeRaw)

    kanaData['hiragana'] = {
        romaji: romajiMap['hiragana'],
        unicode: unicodeMap['hiragana'],
        input: inputMap['hiragana'],
    }

    console.log(kanaData)
}

const unicodeHexToSymbol = (hex: string): string | undefined => {
    if (hex === '') return undefined
    return String.fromCodePoint(parseInt(hex, 16)) 
}


class KanaChar {
    protected romaji: string = ''
    protected _kana: string = ''

    public constructor(romaji: string, kana: string) {
        this.romaji = romaji
        this._kana = kana
    }

    public get kana(): string {
        return this._kana
    }

    // public get length(): number {
    //     return this.input.length
    // }

    // public get value(): string {
    //     return this.input
    // }

    // public get isEmpty(): boolean {
    //     return this.input === ''
    // }

    // public append(value: string): void {
    //     this.input += value
    // }

    // public pop(): string {
    //     if (this.input.length < 1)
    //         return ''

    //     let char = this.input.slice(-1)
    //     this.input = this.input.slice(0, -1)

    //     return char
    // }
}

class KanaText {
    protected buffer: string = ''
    protected text: KanaChar[] = []

    public append(value: string): void {
        this.buffer += value
        this.validate()
    }

    public pop(): void {
        if (this.buffer === '') {
            const char = this.text.pop()

            if (char === undefined)
                return

            // TODO: implement
        }
        else {
            this.buffer = this.buffer.slice(this.buffer.length - 1)
        }
    }

    public get(): [string, string] {
        return [this.buffer, this.text.map((char: KanaChar) => char.kana).join('')]
    }

    public debug(): void {}

    private validate(): void {
        if (this.textUpdated(this.buffer))
            return

        let inputs: string[] | null = this.parseYouon(this.buffer)
        if (inputs !== null && this.textUpdated(...inputs))
            return

        inputs = this.parseDoubleConsonant(this.buffer)
        if (inputs !== null && this.textUpdated(...inputs))
            return

        inputs = this.parseDoubleYouonConsonant(this.buffer)
        if (inputs !== null && this.textUpdated(...inputs))
            return
    }

    private textUpdated(...romajis: string[]): boolean {
        let unicodes: string[] = []
        let symbols: string[] = []

        for (const romaji of romajis) {
            let unicode = kanaData.hiragana.input[romaji]

            if (unicode === undefined) 
                return false
            unicodes.push(unicode)
        }

        for (const unicode of unicodes) {
            let symbol = unicodeHexToSymbol(unicode)

            if (symbol === undefined) 
                return false
            symbols.push(symbol)
        }

        this.text.push(new KanaChar(this.buffer, symbols.join('')))
        this.buffer = ''

        return true
    }

    private parseDoubleConsonant(value: string): [string, string] | null {
        if (value.length < 3 || 
            value.length > 4 ||
            value.charAt(0) === 'x' || // assumes that small chars are invalid
            value.charAt(0) !== value.charAt(1))
            return null

        return ['xtsu', value.slice(1)]
    }

    private parseYouon(value: string): [string, string] | null {
        if (value.length < 2 || value.length > 3)
            return null

        const vowels = ['a', 'u', 'o']
        const letters = value.split('')
        const shch = letters.slice(0, 2).join('')
        const last = letters[letters.length - 1]

        if (!vowels.includes(last))
            return null
        
        if (['sh', 'ch'].includes(shch)) // sha, cha
            return [shch + 'i', 'y' + last]

        else if (letters[0] === 'j' || // ja
                 letters[1] === 'y' && letters[0] !== 'x') // kya, bya, nya
            return [letters[0] + 'i', 'y' + last]

        return null
    }

    private parseDoubleYouonConsonant(value: string): [string, string, string] | null {
        // TODO: In React.StrictMode first render returns null on doubleConsonant

        const youon = this.parseYouon(value.slice(1))
        if (youon === null) return null

        const doubleConsonant = this.parseDoubleConsonant(value.charAt(0) + youon[0])
        if (doubleConsonant === null) return null

        return [...doubleConsonant, youon[1]]
    }
}


export { loadKanaFromJson, KanaText }
