import { DEBUG } from './config.js'
import { fetchFile } from './fs.js'
import { JSO, KanaUnicodeJSO, KanaUnicodeData, KanaArgs, KanaFilters, JSONValue, KeyCode } from './types.js'


class KeyManager {
    public static key: JSO<KeyCode, string> = {
        BACKSPACE: 'Backspace',
        DELETE: 'Delete',
        C: 'KeyC',
        V: 'KeyV',
    }

    private static keys: {
        [uid: string]: (event: KeyboardEvent) => boolean
    } = {}

    public static addKey(uid: string, condition: (event: KeyboardEvent) => boolean) {
        KeyManager.keys[uid] = condition
        return KeyManager
    }

    public static removeKey(uid: string): KeyManager {
        const { [uid]: _, ...newKeys } = KeyManager.keys
        KeyManager.keys = newKeys
        return KeyManager
    }

    public static isKey(uid: string, event: KeyboardEvent): boolean {
        return KeyManager.keys[uid](event)
    }
}


class KanaLoader {
    private separator = '-'
    private defaultFilepath = './../data/unicode.json'
    private static file: JSONValue = null

    public async loadKana({ 
            filepath, 
            key,
            asMap, 
            descriptionsFilter, 
            groupsFilter, 
            inputsFilter, 
            combinationsFilter 
        }: KanaArgs
    ): Promise<KanaUnicodeJSO | JSO<string, string>> {
        const descriptions : string[] = descriptionsFilter || []
        const groups       : string[] = groupsFilter       || []
        const inputs       : string[] = inputsFilter       || []
        const combinations : string[] = combinationsFilter || []

        if (KanaLoader.file === null)
            KanaLoader.file = await fetchFile(filepath || this.defaultFilepath)

        const kana: KanaUnicodeJSO = (KanaLoader.file as { [key: string]: any })[key] ?? {}
        DEBUG && console.debug('Loaded file', KanaLoader.file)

        const included = this.filterForInclusion(kana, { descriptions, groups, inputs, combinations })
        const excluded = this.filterForExclusion(included, { descriptions, groups, inputs, combinations })
        DEBUG && console.debug('Filtered', key, excluded)

        if (!asMap)
            return excluded

        return this.toMap(excluded)
    }

    private filterStringProperty = (prop: string, target: string[]) => !target.length || target.includes(prop)
    private filterArrayProperty = (prop: string[], target: string[]) => !target.length || prop.some((sub: string) => target.includes(sub))
    private inclusion = (arr: string[]) => arr.filter(item => !item.startsWith(this.separator))
    private exclusion = (arr: string[]) => arr.filter(item => item.startsWith(this.separator)).map(item => item.slice(1))

    private filterForInclusion(data: KanaUnicodeJSO, { descriptions, groups, inputs, combinations }: KanaFilters): KanaUnicodeJSO {
        return Object.entries(data).reduce((result: KanaUnicodeJSO, [key, value]: [string, KanaUnicodeData]) => 
            this.filterStringProperty(value.description, this.inclusion(descriptions)) &&
            this.filterStringProperty(value.group, this.inclusion(groups)) &&
            this.filterArrayProperty(value.inputs, this.inclusion(inputs)) && 
            this.filterArrayProperty(value.combination, this.inclusion(combinations))
                ? { ...result, [key]: value } 
                : result, 
            {}
        )
    }

    private filterForExclusion(data: KanaUnicodeJSO, { descriptions, groups, inputs, combinations }: KanaFilters): KanaUnicodeJSO {
        return Object.entries(data).reduce((result: KanaUnicodeJSO, [key, value]: [string, KanaUnicodeData]) => 
            this.filterStringProperty(value.description, this.exclusion(descriptions)) &&
            this.filterStringProperty(value.group, this.exclusion(groups)) &&
            this.filterArrayProperty(value.inputs, this.exclusion(inputs)) && 
            this.filterArrayProperty(value.combination, this.exclusion(combinations))
                ? result 
                : { ...result, [key]: value }, 
            {}
        ) // TODO: does not work if all arrays are empty ... all four methods return true so no unicodes are ever appended
    }     // TODO: actually it doesn't work if we don't have at least one thing to exclude -_-

    private toMap(data: KanaUnicodeJSO): JSO<string, string> {
        // Create keys (key inputs) with possible duplicate values (unicodes)
        return Object.entries(data).reduce((result: JSO<string, string>, [key, value]: [string, KanaUnicodeData]) => {
            value.inputs.forEach((input: string) => result[input] = key) 
            return result
        }, {})
    }
}


class Kana {
    private static hiraganaMap: JSO<string, string> = {}
    private static katakanaMap: JSO<string, string> = {}
    private static loader: KanaLoader | null = null

    public static get HIRAGANA(): JSO<string, string> {
        return Kana.hiraganaMap
    }

    public static get KATAKANA(): JSO<string, string> {
        return Kana.katakanaMap
    }

    public static get HIRAGANA_CODES(): string[] {
        return [...new Set(Object.values(Kana.hiraganaMap))]
    }

    public static get KATAKANA_CODES(): string[] {
        return [...new Set(Object.values(Kana.katakanaMap))]
    }

    public static get HIRAGANA_INPUTS(): string[] {
        return [...new Set(Object.keys(Kana.hiraganaMap))]
    }

    public static get KATAKANA_INPUTS(): string[] {
        return [...new Set(Object.keys(Kana.katakanaMap))]
    }

    public static get ALL_HIRAGANA_TEST(): string[] {
        return [
            'a',   'i',   'u',  'e',  'o',  'n',
           'ka',  'ki',  'ku', 'ke', 'ko', 
           'ga',  'gi',  'gu', 'ge', 'go', 
           'sa', 'shi',  'su', 'se', 'so',
           'za',  'ji',  'zu', 'ze', 'zo',
           'ta', 'chi', 'tsu', 'te', 'to',
           'da',               'de', 'do',
           'na',  'ni',  'nu', 'ne', 'no',
           'ha',  'hi',  'fu', 'he', 'ho',
           'ba',  'bi',  'bu', 'be', 'bo',
           'pa',  'pi',  'pu', 'pe', 'po',
           'ma',  'mi',  'mu', 'me', 'mo',
           'ya',         'yu',       'yo',
           'ra',  'ri',  'ru', 're', 'ro',
           'wa',                     'wo',
          'kya',        'kyu',      'kyo',
          'gya',        'gyu',      'gyo',
          'sha',        'shu',      'sho',
           'ja',         'ju',       'jo',
          'cha',        'chu',      'cho',
          'nya',        'nyu',      'nyo',
          'hya',        'hyu',      'hyo',
          'bya',        'byu',      'byo',
          'pya',        'pyu',      'pyo',
          'mya',        'myu',      'myo',
          'rya',        'ryu',      'ryo',
      ]
    }

    public static hiragana(key: string): string | null {
        const value = Kana.hiraganaMap[key]
        return value === undefined ? null : value
    }

    public static katakana(key: string): string | null {
        const value = Kana.katakanaMap[key]
        return value === undefined ? null : value
    }

    public static async loadHiragana(args: Omit<KanaArgs, 'key'>): Promise<void> {
        Kana.hiraganaMap = await Kana.loadKana({ ...args, key: 'hiragana' })
    }

    public static async loadKatakana(args: Omit<KanaArgs, 'key'>): Promise<void> {
        Kana.katakanaMap = await Kana.loadKana({ ...args, key: 'katakana' })
    }

    private static async loadKana(args: KanaArgs): Promise<JSO<string, string>> {
        if (Kana.loader === null)
            Kana.loader = new KanaLoader()

        return await Kana.loader.loadKana(args) as JSO<string, string>
    }
}


abstract class KanaChar {
    protected input: string = ''
    protected output: string = ''

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

    public abstract get isDoubleConsonant(): boolean

    public abstract get isYouon(): [string, string] | null

    public abstract get isDoubleConsonantAndYouon(): [string, string, string] | null

    public static isVowel(value: string): boolean {
        return ['a', 'i', 'u', 'e', 'o'].includes(value)
    }

    public static isRomaji(char: string): boolean {
        return /[a-zA-Z]/.test(char)
    }

    public static hex2symbol(value: string): string {
        return String.fromCodePoint(parseInt(value, 16))  // TODO: if value is empty then parseInt returns NaN
    }

    public append(char: string) {
        if (char === '')
            return

        if (!this.isValid)
            this.input += char
        else if (this.isN && (KanaChar.isVowel(char) || char === 'y'))
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

    protected abstract getChar(key: string): string | null

    protected validate(): boolean {
        if (this.isDoubleConsonant) {
            const [a, b] = [this.getChar('xtsu'), this.getChar(this.input.slice(1))]

            if (a === null || b === null) {
                return false
            }

            this.output = KanaChar.hex2symbol(a)
                        + KanaChar.hex2symbol(b)
            return true
        }

        let youon: [string, string] | null = this.isYouon
        if (youon !== null) {
            const [a, b] = [this.getChar(youon[0]), this.getChar(youon[1])]

            if (a === null || b === null) {
                return false
            }

            this.output = KanaChar.hex2symbol(a)
                        + KanaChar.hex2symbol(b)
            return true
        }

        let double_consonant_and_youon: [string, string, string] | null = this.isDoubleConsonantAndYouon
        if (double_consonant_and_youon !== null) {
            const [a, b, c] = [this.getChar(double_consonant_and_youon[0]), this.getChar(double_consonant_and_youon[1]), this.getChar(double_consonant_and_youon[2])]

            if (a === null || b === null || c == null) {
                return false
            }

            this.output = KanaChar.hex2symbol(a)
                        + KanaChar.hex2symbol(b)
                        + KanaChar.hex2symbol(c)
            return true
        }

        let raw_code = this.getChar(this.input)
        if (raw_code !== null) {
            this.output = KanaChar.hex2symbol(raw_code)
            return true
        }

        this.output = ''
        return false
    }
}


class HiraganaChar extends KanaChar {
    public get isDoubleConsonant(): boolean {
        return this.input.length > 2 && // tte, ccha
        this.input.charAt(0) === this.input.charAt(1) &&
        this.getChar(this.input.slice(1)) !== null
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

    protected getChar(key: string): string | null {
        return Kana.hiragana(key)
    }
}


export { KeyManager, Kana, KanaLoader, HiraganaChar }
