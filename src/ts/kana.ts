import { DEBUG } from './config.js'
import { fetchFile } from './fs.js'
import { JSO, HiraganaUnicodeJSO, HiraganaUnicodeData, LoadKanaArgs } from './types.js'


// const HIRAGANA: JSO<string, string> = await loadHiraganaAsMap({ 
//     groupsFilter: ['hiragana letters', 'small letters', 'combinable letters'],
//     inputsFilter: ['-xa', '-xi', '-xu', '-xe', '-xo', '-xka', '-xke', '-xwa', '-wi', '-vu', '-we']
// })



class Kana {
    private static _hiragana: JSO<string, string> = {}

    public static async loadHiragana(args: LoadKanaArgs): Promise<void> {
        Kana._hiragana = await loadHiraganaAsMap(args)
    }

    public static get HIRAGANA(): JSO<string, string> {
        return Kana._hiragana
    }

    public static get HIRAGANA_CODES(): string[] {
        return [...new Set(Object.values(Kana._hiragana))]
    }

    public static hiragana(key: string): string | null {
        const value = Kana._hiragana[key]
        return value === undefined ? null : value
    }
}


class HiraganaChar {
    private input: string = ''
    private output: string = ''

    public constructor(value?: string) {
        if (value !== undefined)
            this.append(value)
    }

    public get length(): number {
        return this.isValid ? this.output.length : this.input.length
    }

    public get romaji(): string {
        return this.input
    }

    public get hiragana(): string {
        return this.output
    }

    public get value(): string {
        return this.isValid ? this.output : this.input
    }

    public get isEmpty(): boolean {
        return this.input === ''
    }

    public get isValid(): boolean {
        return this.output !== ''
    }

    public get isFinal(): boolean {
        return this.isValid && !this.isN
    }

    public get isN(): boolean {
        return this.input === 'n'
    }

    public get isDoubleConsonant(): boolean {
        return this.input.length > 2 && // tte, ccha
            this.input.charAt(0) === this.input.charAt(1) &&
            Kana.hiragana(this.input.slice(1)) !== null
            // HIRAGANA[this.input.slice(1)] !== undefined
    }

    public get isYouon(): [string, string] | null {
        const consonants = ['k', 'n', 'h', 'm', 'r', 'g', 'b', 'p']
        const yayuyo = ['ya', 'yu', 'yo']
        const shch = ['sh', 'ch']
        const auo = ['a', 'u', 'o']

        if ( // kya, nyu, pyo
            this.input.length === 3 && 
            consonants.includes(this.input.charAt(0)) &&
            yayuyo.includes(this.input.slice(1))
        ) {
            return [this.input.charAt(0) + 'i', 'x' + this.input.slice(1)]
        }
        else if ( // sha, chu
            this.input.length === 3 && 
            shch.includes(this.input.slice(0, 2)) && 
            auo.includes(this.input.charAt(2))
        ) {
            return [this.input.slice(0, 2) + 'i', 'xy' + this.input.charAt(2)]
        }
        else if ( // ja
            this.input.length === 2 && 
            'j' == this.input.charAt(0) && 
            auo.includes(this.input.charAt(1))
        ) {
            return ['ji', 'xy' + this.input.charAt(1)]
        }

        return null
    }

    public get isDoubleConsonantAndYouon(): [string, string, string] | null {
        if (this.input.charAt(0) !== this.input.charAt(1))
            return null

        const youon = new HiraganaChar(this.input.slice(1))
        const youon_tuple = youon.isYouon

        if (youon_tuple !== null)
            return ['xtsu', ...youon_tuple]
        return null
    }

    public static isVowel(value: string): boolean {
        return ['a', 'i', 'u', 'e', 'o'].includes(value)
    }

    public static isRomaji(char: string): boolean {
        return /[a-zA-Z]/.test(char)
    }

    public static hex2symbol(value: string): string {
        return String.fromCodePoint(parseInt(value, 16))
    }

    public append(char: string) {
        if (char === '')
            return

        if (!this.isValid)
            this.input += char
        else if (this.isN && (HiraganaChar.isVowel(char) || char === 'y'))
            this.input += char
        else
            return

        this.validate()
    }

    public pop(): string {
        if (this.input.length < 1)
            return ''

        let char = this.input.slice(-1)
        this.input = this.input.slice(0, -1)
        this.validate()
        return char
    }

    private validate(): boolean {
        if (this.isDoubleConsonant) {
            const [a, b] = [Kana.hiragana('xtsu'), Kana.hiragana(this.input.slice(1))]

            if (a === null || b === null) {
                return false
            }

            this.output = HiraganaChar.hex2symbol(a)
                        + HiraganaChar.hex2symbol(b)
            return true
        }

        let youon: [string, string] | null = this.isYouon
        if (youon !== null) {
            const [a, b] = [Kana.hiragana(youon[0]), Kana.hiragana(youon[1])]

            if (a === null || b === null) {
                return false
            }

            this.output = HiraganaChar.hex2symbol(a)
                        + HiraganaChar.hex2symbol(b)
            return true
        }

        let double_consonant_and_youon: [string, string, string] | null = this.isDoubleConsonantAndYouon
        if (double_consonant_and_youon !== null) {
            const [a, b, c] = [Kana.hiragana(double_consonant_and_youon[0]), Kana.hiragana(double_consonant_and_youon[1]), Kana.hiragana(double_consonant_and_youon[2])]

            if (a === null || b === null || c == null) {
                return false
            }

            this.output = HiraganaChar.hex2symbol(a)
                        + HiraganaChar.hex2symbol(b)
                        + HiraganaChar.hex2symbol(c)
            return true
        }

        let raw_code = Kana.hiragana(this.input)
        if (raw_code !== null) {
            this.output = HiraganaChar.hex2symbol(raw_code)
            return true
        }

        this.output = ''
        return false
    }
}

async function loadHiragana({ 
        filepath, 
        descriptionsFilter, 
        groupsFilter, 
        inputsFilter, 
        combinationsFilter 
    }
    : LoadKanaArgs 
    = {}
): Promise<HiraganaUnicodeJSO | {}> {
    const separator = '-'
    const filterStringProperty = (prop: string, target: string[]) => !target.length || target.includes(prop)
    const filterArrayProperty = (prop: string[], target: string[]) => !target.length || prop.some((sub: string) => target.includes(sub))
    const inclusion = (arr: string[]) => arr.filter(item => !item.startsWith(separator))
    const exclusion = (arr: string[]) => arr.filter(item => item.startsWith(separator)).map(item => item.slice(1))

    const descriptions: string[] = descriptionsFilter || []
    const groups:       string[] = groupsFilter       || []
    const inputs:       string[] = inputsFilter       || []
    const combinations: string[] = combinationsFilter || []
    
    const { hiragana }: { hiragana: HiraganaUnicodeJSO } = await fetchFile(filepath || './../data/unicode.json')

    if (hiragana === null)
        return {}

    const included = Object.entries(hiragana).reduce((result: HiraganaUnicodeJSO, [key, value]: [string, HiraganaUnicodeData]) => 
        filterStringProperty(value.description, inclusion(descriptions)) &&
        filterStringProperty(value.group, inclusion(groups)) &&
        filterArrayProperty(value.inputs, inclusion(inputs)) && 
        filterArrayProperty(value.combination, inclusion(combinations))
            ? { ...result, [key]: value } 
            : result, 
        {}
    )

    const excluded = Object.entries(included).reduce((result: HiraganaUnicodeJSO, [key, value]: [string, HiraganaUnicodeData]) => 
        filterStringProperty(value.description, exclusion(descriptions)) &&
        filterStringProperty(value.group, exclusion(groups)) &&
        filterArrayProperty(value.inputs, exclusion(inputs)) && 
        filterArrayProperty(value.combination, exclusion(combinations))
            ? result 
            : { ...result, [key]: value }, 
        {}
    )
    
    return excluded
}

async function loadHiraganaAsMap({ 
        filepath, 
        descriptionsFilter, 
        groupsFilter, 
        inputsFilter, 
        combinationsFilter 
    }
    : LoadKanaArgs 
    = {}
): Promise<JSO<string, string> | {}> {
    const data: HiraganaUnicodeJSO = await loadHiragana({ filepath, descriptionsFilter, groupsFilter, inputsFilter, combinationsFilter })

    // Create keys (key inputs) with possible duplicate values (unicodes)
    const map = Object.entries(data).reduce((result: JSO<string, string>, [key, value]: [string, HiraganaUnicodeData]) => {
        value.inputs.forEach((input: string) => result[input] = key) 
        return result
    }, {})

    return map
}


export { Kana, HiraganaChar, loadHiragana, loadHiraganaAsMap }
