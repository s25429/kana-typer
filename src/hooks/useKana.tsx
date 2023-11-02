import type { Kana } from '../types/kana'

import { missingUnicode } from '../utils/kana'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { fetchKana, selectStatus, selectKana } from '../redux/slices/kana'



interface KanaFunctions {
    unicodeHexToSymbol: (hex: Kana.Unicode) => string
    symbolToUnicodeHex: (symbol: string) => Kana.Unicode
    validRomaji: (romaji: Kana.Romaji, family: Kana.Family) => boolean
    validUnicode: (romaji: Kana.Romaji, family: Kana.Family) => boolean
    parseSokuon: (romaji: Kana.Romaji) => Kana.Romaji[] | null
    parseYoon: (romaji: Kana.Romaji) => Kana.Romaji[] | null
    parseYoonWithSokuon: (romaji: Kana.Romaji) => Kana.Romaji[] | null
    parseAvailableKana: (romaji: Kana.Romaji) => Kana.Romaji[] | null
    generateRandom: ({ 
            family, length 
        }: { 
            family: Kana.FamilySum, length: number 
        }) => Kana.Char[]
}


function useKana({
    autoload 
}: { 
    autoload: boolean 
} = { 
    autoload: true 
}): KanaFunctions {
    const kana = useAppSelector(selectKana)
    const status = useAppSelector(selectStatus)
    const dispatch = useAppDispatch()


    /**
     * Converts unicode in string hex format to unicode symbol. 
     * If hex was impossible to convert to hexadecimal number, hex "25a1" is used.
     */
    const unicodeHexToSymbol = (
        hex: Kana.Unicode
    ): string => (
        String.fromCodePoint(parseInt(hex || missingUnicode, 16))
    )

    /**
     * Converts unicode symbol to its hex representation.
     * If symbol was impossible to convert, hex "25a1" is returned.
     */
    const symbolToUnicodeHex = (
        symbol: string
    ): Kana.Unicode => (
        symbol.codePointAt(0)?.toString(16) ?? missingUnicode
    )

    /**
     * Checks if given romaji is valid with loaded kana.
     * @param romaji - slice of text containing (hopefully) only romaji part
     */
    const validRomaji = (
        romaji: Kana.Romaji, 
        family: Kana.Family = 'hiragana'
    ): boolean => (
        Object
            .keys(kana ? kana[family].romaji : {})
            .includes(romaji)
    )

    /**
     * Checks if given romaji has unicode value associated with it.
     * @param romaji - slice of text containing (hopefully) only romaji part
     */
    const validUnicode = (
        romaji: string, 
        family: Kana.Family = 'hiragana'
    ): boolean => (
        Object
            .keys(kana ? kana[family].map : {})
            .includes(romaji)
    )

    /**
     * Parses given input in romaji if it contains a double consonant.
     * @param romaji - text in romaji, e.g. kka
     * @returns double consonant broken down into kana characters in romaji or null if not applicable.
     */
    const parseSokuon = (
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
    const parseYoon = (
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
    const parseYoonWithSokuon = (
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
    const parseAvailableKana = (
        romaji: Kana.Romaji
    ): Kana.Romaji[] | null => (
        validRomaji(romaji) || validUnicode(romaji) 
            ? [romaji] 
            : null
    )

    const generateRandom = ({
        family,
        length
    }: {
        family: Kana.FamilySum,
        length: number
    } = {
        family: [],
        length: 8
    }): Kana.Char[] => {
        if (kana === undefined) {
            console.error('Kana has not been loaded to global scope.')
            return []
        }

        const generate = (family: Kana.Family): Kana.Char[] => {
            const allInputs = Object
                .keys(kana[family].romaji)
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
                parseAvailableKana(input) ??
                ['']
            ))

            const chars = parsedRomaji.map((romajiArray: Kana.Romaji[]) => {
                return romajiArray
                    .map((romaji: Kana.Romaji) => (
                        validRomaji(romaji.charAt(0) === 'x' ? romaji.slice(1) : romaji)
                            ? kana.hiragana.map[romaji]
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
    
        if ('hiragana' in family)
            return generate('hiragana')

        return []
    }


    if (autoload) useEffect(() => {
        if (status === 'pending')
            dispatch(fetchKana())
    }, [status, dispatch])


    return {
        unicodeHexToSymbol,
        symbolToUnicodeHex,
        validRomaji,
        validUnicode,
        parseSokuon,
        parseYoon,
        parseYoonWithSokuon,
        parseAvailableKana,
        generateRandom,
    }
}


export default useKana
