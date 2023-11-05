import type { Kana } from '../types/kana' 
import type { KanaReduxPayload } from '../redux/slices/kana'


export const missingUnicode: Kana.Unicode = '25a1'


/**
     * Converts unicode in string hex format to unicode symbol. 
     * If hex was impossible to convert to hexadecimal number, hex "25a1" is used.
     */
export const unicodeHexToSymbol = (
    hex: Kana.Unicode
): string => (
    String.fromCodePoint(parseInt(hex || missingUnicode, 16))
)

/**
 * Converts unicode symbol to its hex representation.
 * If symbol was impossible to convert, hex "25a1" is returned.
 */
export const symbolToUnicodeHex = (
    symbol: string
): Kana.Unicode => (
    symbol.codePointAt(0)?.toString(16) ?? missingUnicode
)

/**
 * Checks if given symbol (e.g. あ) is a compilable symbol or an unknown one.
 */
export const isValidSymbol = (symbol: string): boolean => (
    unicodeHexToSymbol(missingUnicode) !== symbol
)

/**
 * Checks if given romaji is valid with loaded kana.
 * @param romaji - slice of text containing (hopefully) only romaji part
 */
export const validRomaji = (
    payload: KanaReduxPayload,
    romaji: Kana.Romaji, 
    family: Kana.Family = 'hiragana'
): boolean => (
    Object
        .keys(payload ? payload[family].map : {})
        .includes(romaji)
)

/**
 * Checks if given romaji has unicode value associated with it.
 * @param romaji - slice of text containing (hopefully) only romaji part
 */
export const validUnicode = (
    payload: KanaReduxPayload,
    romaji: Kana.Romaji, 
    family: Kana.Family = 'hiragana'
): boolean => (
    Object
        .keys(payload ? payload[family].map : {})
        .includes(romaji)
)

/**
 * Parses given input in romaji if it contains a double consonant.
 * @param romaji - text in romaji, e.g. kka
 * @returns double consonant broken down into kana characters in romaji or null if not applicable.
 */
export const parseSokuon = (
    romaji: Kana.Romaji
): Kana.Romaji[] | null => (
    romaji.length < 3 || // kk will not be recognized as valid
    romaji.length > 4 || // ssshi will not be recognized as valid
    romaji.charAt(0) === 'x' || // assumes small chars with sokuon as invalid, e.g. っぁ, where ぁ =/= あ
    romaji.charAt(0) !== romaji.charAt(1) // two first letters are not the same
        ? null
        : ['xtsu', romaji.slice(1)]
)

/**
 * Parses given input in romaji if it contains a yoon.
 * @param romaji - text in romaji, e.g. kya
 * @returns yoon broken down into kana characters in romaji or null if not applicable.
 */
export const parseYoon = (
    romaji: Kana.Romaji
): Kana.Romaji[] | null => {
    const vowels = ['a', 'u', 'e', 'o'] // TODO: take this from some database too, also probably will not work for katakana
    const letters = romaji.split('')
    const shch = letters.slice(0, 2).join('')
    const last = letters[letters.length - 1]

    if (!vowels.includes(last)) // does not end on vowel => not yoon
        return null

    if (['sh', 'ch'].includes(shch)) // sha, cha
        return [shch + 'i', 'xy' + last]
    
    else if (letters[0] === 'j' || // ja
             letters[1] === 'y' && letters[0] !== 'x' && letters[0] !== letters[1]) // kya, bya, nya
        return [letters[0] + 'i', 'xy' + last]
    
    return null
}

/**
 * Parses given input in romaji if it contains double consonant and yoon.
 * @param romaji - text in romaji, e.g. kkya
 * @returns double consonant and yoon broken down into kana characters in romaji or null if not applicable.
 */
export const parseYoonWithSokuon = (
    romaji: Kana.Romaji
): Kana.Romaji[] | null => {
    const yoon = parseYoon(romaji.slice(1))
    if (yoon === null)
        return null

    const sokuon = parseSokuon(romaji.charAt(0) + yoon[0])
    if (sokuon === null)
        return null

    return [...sokuon, yoon[1]]
}

/**
 * Parses given input in romaji only if this input and unicode corresponding to it is available in database. 
 * Such input only, at most, accepts kana that is comprised of only one unicode character, but can be less dependant on given database content.
 * To see what kana is comprised of only one unicode character, seek help on the internet.
 * @param romaji - text in romaji, e.g. ka
 * @returns romaji in array (so that it follows structure of other parse functions) or null if not applicable.
 */
export const parseAvailableKana = (
    payload: KanaReduxPayload,
    romaji: Kana.Romaji,
    family: Kana.Family = 'hiragana'
): Kana.Romaji[] | null => (
    validRomaji(payload, romaji, family) ? [romaji] : null
)

/**
 * Transforms given romaji into kana representation with a symbol.
 * @param payload - redux slice's payload
 * @param romaji - romaji representation of kana char
 * @param family - kana family
 * @returns object that contains original romaji and kana char
 */
export const parseRomaji = (
    payload: KanaReduxPayload,
    romaji: Kana.Romaji,
    family: Kana.Family = 'hiragana'
): Kana.Char => {
    const parsed = 
        parseYoonWithSokuon(romaji) ?? 
        parseYoon(romaji) ?? 
        parseSokuon(romaji) ??
        parseAvailableKana(payload, romaji, family) ??
        ['']

    const char = parsed
        .map((romaji: Kana.Romaji) => (
            payload !== undefined && validRomaji(payload, romaji, family)
                ? payload[family].map[romaji]
                : missingUnicode
        ))
        .map(unicodeHexToSymbol)
        .join('')

    return { kana: char, romaji }
}

// TODO: write documentation
export const generateRandom = ({
    payload,
    family,
    length
}: {
    payload: KanaReduxPayload,
    family: Kana.FamilySum,
    length: number
} = {
    payload: undefined,
    family: [],
    length: 8
}): Kana.Char[] => {
    if (payload === undefined) {
        console.error('Kana has not been loaded to global scope.')
        return []
    }

    const generate = (family: Kana.Family): Kana.Char[] => {
        const allPossibleInputs = Object
            .values(payload[family].romaji)
            .reduce((acc: Kana.Romaji[], data: Kana.RomajiData) => (
                data.variants.sokuon
                    ? [...acc, data.value, data.value.charAt(0) + data.value]
                    : [...acc, data.value]
            ), [])

        const generatedInputs: string[] = []

        while (generatedInputs.join('').length < length) {
            const availableLength = length - generatedInputs.join('').length
            let romaji = ''

            while (romaji === '' || romaji.length > availableLength) {
                const index = Math.floor(Math.random() * allPossibleInputs.length)
                romaji = allPossibleInputs[index]
            }

            generatedInputs.push(romaji)
        }

        console.log(generatedInputs)

        return generatedInputs.map((romaji: Kana.Romaji) => (
            parseRomaji(payload, romaji, family)
        ))
    }

    if (family.includes('hiragana'))
        return generate('hiragana')

    return []
}
