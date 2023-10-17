import React, { useState } from 'react'
import { KanaText } from '../utils/kana'


const useKanaText = (): [{ romaji: string, kana: string }, (value: string) => void] => {
    const [romaji, setRomaji] = useState('')
    const [kana, setKana] = useState('')
    const kanaText = new KanaText()

    const useKanaText = (value: string) => {
        kanaText.append(value)

        let [newRomaji, newKana] = kanaText.get()
        setRomaji(newRomaji)
        setKana(newKana)
        console.log(kanaText)
    }

    return [{ romaji, kana }, useKanaText]
}


export default useKanaText
