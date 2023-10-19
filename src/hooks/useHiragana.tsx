import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { load as loadHiragana } from '../redux/slices/hiragana'


interface AddOptions {
    skipValidation : boolean
}

interface RemoveOptions {
    amount        : number
    parseToRomaji : boolean
}


const initialAddOptions: AddOptions = {
    skipValidation: false,
}

const initialRemoveOptions: RemoveOptions = {
    amount: 1,
    parseToRomaji: true,
}


function useHiragana(): [string, { [key: string]: Function }] {
    const HIRAGANA = useAppSelector((state) => state.hiragana)
    const dispatch = useAppDispatch()

    // TODO: maybe some hooks can be useRef?
    const [offset, setOffset] = useState(0)
    const [text, setText] = useState('')
    const [sizes, setSizes] = useState<number[]>([]) // TODO: using this with useEffect ONLY with passing useMemo as dependency


    const add = (char: string, { skipValidation }: AddOptions = initialAddOptions) => {
        const newText = text + char

        if (skipValidation)
            return setText(newText)

        const romajiSlice = newText.slice(offset)
        const hiraganaSlice = validate(romajiSlice)

        if (hiraganaSlice === null)
            return setText(newText)

        setOffset(prevOffset => prevOffset + hiraganaSlice.length)
        setSizes(prevSizes => [...prevSizes, hiraganaSlice.length])
        setText(prevText => prevText.slice(0, offset) + hiraganaSlice)
    }

    // const remove = ({ amount, parseToRomaji }: RemoveOptions = initialRemoveOptions): string => {
    //     let newOffset = offset
    //     let newSizes = [...sizes]
    //     let newText = text
    //     let diff = ''

    //     for (let i = 0; i < amount; i++) {
    //         let char = newText.slice(-1)

    //         if (parseToRomaji && isRomaji(char)) {
    //             let unicode = symbolToUnicodeHex(char)
    //             let romaji = HIRAGANA.unicode[unicode]?.inputs[0] ?? null

    //             if (romaji === null) console.error('No idea how this could happen...')

    //             newText = newText.slice(0, -1) + romaji.slice(0, -1)
    //             diff += romaji.slice(-1)

    //             newOffset -= 1
    //             newSizes.pop()
    //         }
    //         else {
    //             newText = newText.slice(0, -1)
    //             diff += char
    //         }
    //     }

    //     setOffset(newOffset)
    //     setSizes(newSizes)
    //     setText(newText)

    //     return diff
    // }
    const remove = (): string => {
        let buffer = ''
        let sliced = text.slice(-1)

        if (!isRomaji(sliced)) {
            // Take all kana chars that make up specified romaji
            const amount = 1 * (sizes.pop() ?? 1)
            sliced = text.slice(-1 * amount)

            let unicode = symbolToUnicodeHex(sliced)
            let romaji = HIRAGANA.unicode[unicode]?.inputs[0] ?? null

            if (romaji === null) { 
                console.error('Previously valid kana with matching unicode has not found a valid match now... HOW?!')
                return '' 
            }

            buffer = romaji.slice(0, -1)
            sliced = romaji.slice(-1)

            setOffset(prevOffset => prevOffset - 1)
            setSizes(prevSizes => { 
                prevSizes.pop() 
                return prevSizes
            })
        }

        setText(prevText => prevText.slice(-1) + buffer)

        return sliced
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

    const symbolToUnicodeHex = (symbol: string): string => (
        symbol.codePointAt(0)?.toString(16) ?? '25a1'
    )

    const isRomaji = (text: string) => !/[^a-zA-Z]/.test(text)

    const parseSokuon = (romajiSlice: string): string[] | null => (
        romajiSlice.length < 3 || 
        romajiSlice.length > 4 ||
        romajiSlice.charAt(0) === 'x' || // assumes small chars with sokuon as invalid, e.g. っぁ, where ぁ =/= あ
        romajiSlice.charAt(0) !== romajiSlice.charAt(1) // two first letters are not the same
            ? null
            : ['xtsu', romajiSlice.slice(1)]
    )

    const parseYoon = (romajiSlice: string): string[] | null => {
        const vowels = ['a', 'u', 'e', 'o'] // TODO: take this from some database too
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

    const parseYoonWithSokuon = (romajiSlice: string): string[] | null => {
        const yoon = parseYoon(romajiSlice.slice(1))
        if (yoon === null)
            return null

        const sokuon = parseSokuon(romajiSlice.charAt(0) + yoon[0])
        if (sokuon === null)
            return null

        return [...sokuon, yoon[1]]
    }

    const parseStandardKana = (romajiSlice: string): string[] | null => (
        validRomaji(romajiSlice) || validUnicode(romajiSlice) 
            ? [romajiSlice] 
            : null
    )

    const validate = (romajiSlice: string): string | null => {
        // Parses slice into proper romaji inputs or leaves it as it was passed
        const inputs = parseYoonWithSokuon(romajiSlice) ?? 
                       parseYoon(romajiSlice) ?? 
                       parseSokuon(romajiSlice) ??
                       parseStandardKana(romajiSlice)

        return inputs?.reduce((acc: string, input: string) => (
            acc + unicodeHexToSymbol(HIRAGANA.input[input])
        ), '') ?? null
    }


    useEffect(() => { dispatch(loadHiragana()) }, [])

    return [text, { add, remove }]
}


export default useHiragana
