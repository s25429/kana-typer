import { useState } from 'react'
import { useAppSelector } from '../redux/hooks'


type Char = string


function useHiragana(): [string, { [key: string]: Function }] {
    const HIRAGANA = useAppSelector((state) => state.hiragana)
    const [text, setText] = useState('')

    const add = (char: Char) => setText(text + char)
    const remove = (): Char => {
        let char = text.slice(-1)
        setText(text.slice(0, -1))
        return char
    }

    return [text, { add, remove }]
}


export default useHiragana
