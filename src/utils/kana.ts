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
 * 
 */
export const charsToString = (
    chars: Kana.Char[]
): string => (
    chars
        .map(({ kana, romaji }: Kana.Char) => kana !== '' ? kana : romaji)
        .join('')
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
        .keys(payload ? payload[family].romaji : {})
        .includes(romaji)
)

/**
 * Checks if given romaji has unicode value associated with it.
 * @param romaji - slice of text containing (hopefully) only romaji part
 */
export const validUnicode = (
    payload: KanaReduxPayload,
    romaji: string, 
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
        : [romaji.charAt(0) === 'n' ? 'n' : 'xtsu', romaji.slice(1)]
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
    romaji: Kana.Romaji
): Kana.Romaji[] | null => (
    validRomaji(payload, romaji) || validUnicode(payload, romaji) 
        ? [romaji] 
        : null
)

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
        const allInputs = Object
            .keys(payload[family].romaji)
            .reduce((acc: Kana.Romaji[], value: Kana.Romaji) => (
                value.length > 1 && value.charAt(0) !== 'x'
                    ? [...acc, value, value.charAt(0) + value]
                    : [...acc, value]
            ), [])
        
        const generatedInputs = Array.from({ length }, () => (
            allInputs[Math.floor(Math.random() * allInputs.length)]
        ))

        const parsedRomaji = generatedInputs.map((input: Kana.Romaji) => (
            parseYoonWithSokuon(input) ?? 
            parseYoon(input) ?? 
            parseSokuon(input) ??
            parseAvailableKana(payload, input) ??
            ['']
        ))

        const chars = parsedRomaji.map((romajiArray: Kana.Romaji[]) => {
            return romajiArray
                .map((romaji: Kana.Romaji) => (
                    validRomaji(payload, romaji.charAt(0) === 'x' ? romaji.slice(1) : romaji)
                        ? payload.hiragana.map[romaji]
                        : missingUnicode
                ))
                .map(unicodeHexToSymbol)
                .join('')
        })

        return chars.map((char: string, index: number) => ({ 
            kana: char, 
            romaji: generatedInputs[index]
        }))
    }

    if (family.includes('hiragana'))
        return generate('hiragana')

    return []
}
