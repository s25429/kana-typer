import type { Kana } from '../types/kana'

import { useState } from 'react'
import { useAppSelector } from '../redux/hooks'
import { selectKana } from '../redux/slices/kana'
import useKanaTyper from '../hooks/useKanaTyper'

import * as KanaUtils from '../utils/kana'
import { getTextWidth } from '../utils/text'


function KanaTest() {
    console.log('KanaTest')

    const payload = useAppSelector(selectKana)

    const [kana, funcs] = useKanaTyper()
    const [inputText, setInputText] = useState<string>('')
    const [index, setIndex] = useState<number>(0)
    const [offset, setOffset] = useState<number>(0)

    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const char = KanaUtils.parseRomaji(payload, value.toLowerCase(), 'hiragana')
        console.log(offset)

        // correct char
        if (char.kana === kana[index].kana) {
            console.log('correct')

            setInputText('')
            setIndex(prevIndex => prevIndex + 1)
            setOffset(prevOffset => prevOffset + (
                getTextWidth(
                    KanaUtils.isValidSymbol(kana[index].kana) 
                        ? kana[index].kana
                        : kana[index].romaji
                )
            ))
        }

        // wrong char
        //  If user types wrong romaji, but have not given valid kana yet
        //  If romaji typed is not part of the correct answer
        else if (char.kana !== KanaUtils.unicodeHexToSymbol('') && 
                !kana[index].romaji.includes(char.romaji)) { 
            console.error('wrong')

            setInputText('')
            setIndex(prevIndex => prevIndex + 1)
            setOffset(prevOffset => prevOffset + (
                getTextWidth(
                    KanaUtils.isValidSymbol(kana[index].kana) 
                        ? kana[index].kana
                        : kana[index].romaji
                )
            ))
        }

        // not done typing
        else {
            setInputText(value)
        }
    }

    return (<>
        <div style={{ transform: `translateX(-${offset}px)` }}>
            {kana.map(({ kana, romaji }: Kana.Char, index: number) => (
                <span key={index}>
                    {KanaUtils.isValidSymbol(kana) ? kana : romaji} 
                </span>
            ))}
        </div>
        <br />
        <input type="text" value={inputText} onChange={handleInputOnChange} />
        <button onClick={funcs.reloadChars}>🔃</button>
    </>)
}


export default KanaTest
