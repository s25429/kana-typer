import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { load as loadHiragana } from '../redux/slices/hiragana'


function useHiragana(): [string[], Function] {
    const HIRAGANA = useAppSelector((state) => state.hiragana)
    const dispatch = useAppDispatch()

    const [text, setText] = useState<string[]>([])


    /**
     * Converts unicode symbol to its hex representation.
     * If symbol was impossible to convert, hex "25a1" is returned.
     */
    const symbolToUnicodeHex = (symbol: string): string => (
        symbol.codePointAt(0)?.toString(16) ?? '25a1'
    )

    /**
     * Checks if given romaji is valid with loaded kana.
     * @param romaji - slice of text containing (hopefully) only romaji part
     */
    const validRomaji = (romaji: string): boolean => {
        return Object.keys(HIRAGANA.romaji).includes(romaji)
    }

    /**
     * Checks if given romaji has unicode value associated with it.
     * @param romaji - slice of text containing (hopefully) only romaji part
     */
    const validUnicode = (romaji: string): boolean => {
        return Object.keys(HIRAGANA.input).includes(romaji)
    }

    /**
     * Parses given input in romaji if it contains a double consonant.
     * @param romaji - text in romaji, e.g. kka
     * @returns double consonant broken down into kana characters in romaji or null if not applicable.
     */
    const parseSokuon = (romaji: string): string[] | null => (
        romaji.length < 3 || 
        romaji.length > 4 ||
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
    const parseYoon = (romaji: string): string[] | null => {
        const vowels = ['a', 'u', 'e', 'o'] // TODO: take this from some database too, also probably will not work for katakana
        const letters = romaji.split('')
        const shch = letters.slice(0, 2).join('')
        const last = letters[letters.length - 1]

        if (!vowels.includes(last)) // does not end on vowel => not yoon
            return null

        if (['sh', 'ch'].includes(shch)) // sha, cha
            return [shch + 'i', 'xy' + last]
        
        else if (letters[0] === 'j' || // ja
                 letters[1] === 'y' && letters[0] !== 'x') // kya, bya, nya
            return [letters[0] + 'i', 'xy' + last]
        
        return null
    }

    /**
     * Parses given input in romaji if it contains double consonant and yoon.
     * @param romaji - text in romaji, e.g. kkya
     * @returns double consonant and yoon broken down into kana characters in romaji or null if not applicable.
     */
    const parseYoonWithSokuon = (romaji: string): string[] | null => {
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
    const parseAvailableKana = (romaji: string): string[] | null => (
        validRomaji(romaji) || validUnicode(romaji) 
            ? [romaji] 
            : null
    )

    const generate = (length: number = 8) => {
        console.log(HIRAGANA)
        return

        const inputs = Object.keys(HIRAGANA.romaji).reduce((acc: string[], value: string) => (
            value.length > 1 && value.charAt(0) !== 'x' // TODO: what hiragana sounds can have soukon in front of them?
                ? [...acc, value, value.charAt(0) + value]
                : [...acc, value]
        ), [])
        
        const parsedInputs = Array.from({ length }, () => {
            const input = inputs[Math.floor(Math.random() * inputs.length)]

            return parseYoonWithSokuon(input) ?? 
                   parseYoon(input) ?? 
                   parseSokuon(input) ??
                   parseAvailableKana(input) ??
                   ['']
        })

        const unicodes = parsedInputs.map(inputs => inputs.map(input => HIRAGANA.input[input]))
    }


    useEffect(() => { dispatch(loadHiragana()) }, [])

    return [text, generate]
}


export default useHiragana
