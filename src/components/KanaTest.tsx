import type { Kana } from '../types/kana'

import { useState, useEffect, useCallback } from 'react'
import { useAppSelector } from '../redux/hooks'
import { selectKana } from '../redux/slices/kana'
import useKanaTyper from '../hooks/useKanaTyper'

import * as KanaUtils from '../utils/kana'
import { getTextWidth, getStyle } from '../utils/text'


function KanaTest() {
    console.log(KanaTest.name)

    const payload = useAppSelector(selectKana)

    const [kana, setKana] = useKanaTyper()
    
    const [inputText, setInputText] = useState<string>('')
    const [index, setIndex] = useState<number>(0)
    const [offset, setOffset] = useState<number>(0)
    const [stats, setStats] = useState(() => ({
        correct: 0,
        incorrect: 0,
    }))

    /**
     * Calculates the optimal length of generated kana so that more kana can be later generated before user sees the end of it. Greater fill value on initial load is recommended.
     * @param fill - how much size (in percentage) of the actual screen width should characters take
     * @returns an estimated amount of chars to generate
     */
    const getOptimalLength = (fill: number = 0.75) => {
        const char = payload 
            ? KanaUtils.unicodeHexToSymbol(payload.hiragana.map['a'])
            : 'あ'
        const elt = document.querySelector('.kana') || document.body
        const charWidth = getTextWidth(char, elt as HTMLElement)
        const windowWidth = window.innerWidth // TODO: does not include devtools win
        return Math.ceil(windowWidth / charWidth * fill)
    }

    const reloadChars = () => {
        setKana(KanaUtils.generateRandom({ 
            payload: payload, 
            family: ['hiragana'], 
            length: getOptimalLength(1)
        }))
        index === 0 || setIndex(0)
        offset === 0 || setOffset(0)
    }

    const appendChars = (fill: number = 0.75) => {
        setKana(prevChars => ([
            ...prevChars,
            ...KanaUtils.generateRandom({ 
                payload: payload, 
                family: ['hiragana'], 
                length: getOptimalLength(fill)
            })
        ]))
    }

    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const char = KanaUtils.parseRomaji(payload, value.toLowerCase(), 'hiragana')

        // TODO: on romaji "bba" if we type "xtsuba", it will recult in wrong kana on finishing typing "xtsu", because "xtsu" was found as an available symbol.

        // correct char
        if (char.kana === kana[index].kana) {
            console.log('%c' + '✔ Correct!', 'color: lightgreen')

            setInputText('')
            setIndex(prevIndex => prevIndex + 1)
            setOffset(prevOffset => prevOffset + (
                getTextWidth(
                    KanaUtils.validSymbol(kana[index].kana) 
                        ? kana[index].kana
                        : kana[index].romaji,
                    document.querySelector('.kana') as HTMLElement
                )
            ))
            setStats(prevStats => ({ 
                ...prevStats, 
                correct: prevStats.correct + 1
            }))
        }

        // wrong char
        //  If user types wrong romaji, but have not given valid kana yet
        //  If romaji typed is not part of the correct answer
        // TODO: does not matter where part of romaji is: 'sse'.includes('ss') && 'sse'.includes('se'), where latter should be wrong
        else if (char.kana !== KanaUtils.unicodeHexToSymbol('') && 
                !kana[index].romaji.includes(char.romaji)) { 
            console.log('%c' + '✖ Wrong!', 'color: red')

            setInputText('')
            setIndex(prevIndex => prevIndex + 1)
            setOffset(prevOffset => prevOffset + (
                getTextWidth(
                    KanaUtils.validSymbol(kana[index].kana) 
                        ? kana[index].kana
                        : kana[index].romaji,
                    document.querySelector('.kana') as HTMLElement
                )
            ))
            setStats(prevStats => ({ 
                ...prevStats, 
                incorrect: prevStats.incorrect + 1
            }))
        }

        // not done typing
        else {
            console.log('%c' + '⏲ Typing...', 'color: yellow')

            setInputText(value)
        }

        // check if more kanas need to be appended
        const kanaElt = document.querySelector('.kana') as HTMLElement
        const lastElt = kanaElt.children[kanaElt.children.length - 1] as HTMLElement
        const lastEltPos = lastElt.offsetLeft - offset

        if (lastEltPos < window.innerWidth / 2) {
            appendChars()
        }



        // const kanaElt = document.querySelector('.kana') as HTMLElement
        // const matrix = getStyle(kanaElt, 'transform')
        // const translate = matrix.includes('matrix')
        //     ? parseInt(matrix.split(',')[4])
        //     : (() => { console.error('ERROR #12345'); return null })()
        // console.log(translate)
    }

    // useEffect(() => {
    //     index === 0 || setIndex(0)
    //     offset === 0 || setOffset(0)
    // }, [handleKanaReload])

    return (<>
        <main className='typer-container'>
            <div className="typer">
                <div style={{ transform: `translateX(-${offset}px)` }} className='kana'>
                    {kana.map(({ kana, romaji }: Kana.Char, key: number) => (
                        <span key={key} className={
                            (key < index ? 'faded' : '') 
                            + ' ' +
                            (true ? '' : '')
                        }>
                            {KanaUtils.validSymbol(kana) ? kana : romaji} 
                        </span>
                    ))}
                </div>
                <input type="text" value={inputText} onChange={handleInputOnChange} placeholder='type here...' />
            </div>
        </main>

        <section className='stats'>
            <button onClick={reloadChars}>New</button>
            <br />
            <pre>
                <code>
                    ✔ {stats.correct} | ✖ {stats.incorrect}
                </code>
            </pre>
        </section>
    </>)
}


export default KanaTest
