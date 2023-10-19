import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { load as loadHiragana } from '../redux/slices/hiragana'


type UseHiragana = [
    string,
    {
        add: (chars: string, options?: AddOptions) => void
        remove: () => string
    },
]

interface AddOptions {
    skipValidation : boolean
}


const initialAddOptions: AddOptions = {
    skipValidation: false,
}


function useHiragana(): UseHiragana {
    const HIRAGANA = useAppSelector((state) => state.hiragana)
    const dispatch = useAppDispatch()

    // TODO: maybe some hooks can be useRef?
    const [text, setText] = useState('')
    const [sizes, setSizes] = useState<number[]>([]) // TODO: using this with useEffect ONLY with passing useMemo as dependency
    const [romaji, setRomaji] = useState<string[]>([])


    const add = (chars: string, { skipValidation }: AddOptions = initialAddOptions) => {
        const newText = text + chars

        if (skipValidation)
            return setText(newText)

        // Get offset from last successful kana (or ignored romaji) charactes,
        //  create a slice consisting only of previous non-kana (or not ignored) characters
        //  and validate them with the newly added romaji
        const offset = sizes.length ? sizes.reduce((acc, n) => acc + n, 0) : 0 
        const romajiSlice = newText.slice(offset)
        const hiraganaSlice = validate(romajiSlice)

        if (hiraganaSlice === null)
            return setText(newText)

        // setOffset(prevOffset => prevOffset + hiraganaSlice.length)
        setSizes(prevSizes => [...prevSizes, hiraganaSlice.length])
        setRomaji(prevRomaji => [...prevRomaji, romajiSlice])
        setText(prevText => prevText.slice(0, offset) + hiraganaSlice)
    }

    const remove = (): string => {
        const offset = -1
        const slice = text.slice(offset)

        if (!isRomaji(slice)) {
            // Get romaji representation of last kana combination
            //  and get offset equal to the length of this kana combination.
            const romajiChar = romaji.slice(offset).pop() ?? ''
            const textOffset = ([...sizes].pop() ?? -offset) * -1

            setSizes(prevSizes => prevSizes.slice(0, offset))
            setRomaji(prevRomaji => prevRomaji.slice(0, offset))
            setText(prevText => prevText.slice(0, textOffset) + romajiChar.slice(0, offset))

            return romajiChar.slice(offset)
        }

        setText(prevText => prevText.slice(0, offset))
        return slice

    }

    /**
     * Checks if given romaji is valid with loaded kana.
     * @param romajiSlice - slice of text containing (hopefully) only romaji part
     */
    const validRomaji = (romajiSlice: string): boolean => {
        return Object.keys(HIRAGANA.romaji).includes(romajiSlice)
    }

    /**
     * Checks if given romaji has unicode value associated with it.
     * @param romajiSlice - slice of text containing (hopefully) only romaji part
     */
    const validUnicode = (romajiSlice: string): boolean => {
        return Object.keys(HIRAGANA.input).includes(romajiSlice)
    }

    /**
     * Converts unicode in string hex format to unicode symbol. 
     * If hex was impossible to convert to hexadecimal number, hex "25a1" is used.
     */
    const unicodeHexToSymbol = (hex: string): string => (
        String.fromCodePoint(parseInt(hex || '25a1', 16))
    )

    /**
     * Converts unicode symbol to its hex representation.
     * If symbol was impossible to convert, hex "25a1" is returned.
     */
    const symbolToUnicodeHex = (symbol: string): string => (
        symbol.codePointAt(0)?.toString(16) ?? '25a1'
    )

    /**
     * Checks if all characters in text are of latin origin.
     */
    const isRomaji = (text: string): boolean => !/[^a-zA-Z]/.test(text)

    /**
     * Parses given input in romaji if it contains a double consonant.
     * @param romajiSlice - text in romaji, e.g. kka
     * @returns double consonant broken down into kana characters in romaji or null if not applicable.
     */
    const parseSokuon = (romajiSlice: string): string[] | null => (
        romajiSlice.length < 3 || 
        romajiSlice.length > 4 ||
        romajiSlice.charAt(0) === 'x' || // assumes small chars with sokuon as invalid, e.g. っぁ, where ぁ =/= あ
        romajiSlice.charAt(0) !== romajiSlice.charAt(1) // two first letters are not the same
            ? null
            : ['xtsu', romajiSlice.slice(1)]
    )

    /**
     * Parses given input in romaji if it contains a yoon.
     * @param romajiSlice - text in romaji, e.g. kya
     * @returns yoon broken down into kana characters in romaji or null if not applicable.
     */
    const parseYoon = (romajiSlice: string): string[] | null => {
        const vowels = ['a', 'u', 'e', 'o'] // TODO: take this from some database too, also probably will not work for katakana
        const letters = romajiSlice.split('')
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
     * @param romajiSlice - text in romaji, e.g. kkya
     * @returns double consonant and yoon broken down into kana characters in romaji or null if not applicable.
     */
    const parseYoonWithSokuon = (romajiSlice: string): string[] | null => {
        const yoon = parseYoon(romajiSlice.slice(1))
        if (yoon === null)
            return null

        const sokuon = parseSokuon(romajiSlice.charAt(0) + yoon[0])
        if (sokuon === null)
            return null

        return [...sokuon, yoon[1]]
    }

    /**
     * Parses given input in romaji only if this input and unicode corresponding to it is available in database. 
     * Such input only, at most, accepts kana that is comprised of only one unicode character, but can be less dependant on given database content.
     * To see what kana is comprised of only one unicode character, seek help on the internet.
     * @param romajiSlice - text in romaji, e.g. ka
     * @returns romaji in array (so that it follows structure of other parse functions) or null if not applicable.
     */
    const parseAvailableKana = (romajiSlice: string): string[] | null => (
        validRomaji(romajiSlice) || validUnicode(romajiSlice) 
            ? [romajiSlice] 
            : null
    )

    /**
     * Validates given text if it is comprised of valid romaji.
     * @param romajiSlice - text in romaji, e.g. ka, kka, kya, etc.
     * @returns romaji transformed into proper kana characters or null if romaji was invalid.
     */
    const validate = (romajiSlice: string): string | null => {
        // Parses slice into proper romaji inputs or leaves it as it was passed
        const inputs = parseYoonWithSokuon(romajiSlice) ?? 
                       parseYoon(romajiSlice) ?? 
                       parseSokuon(romajiSlice) ??
                       parseAvailableKana(romajiSlice)

        return inputs?.reduce((acc: string, input: string) => (
            acc + unicodeHexToSymbol(HIRAGANA.input[input])
        ), '') ?? null
    }


    useEffect(() => { dispatch(loadHiragana()) }, [])

    return [text, { add, remove }]
}


export default useHiragana
