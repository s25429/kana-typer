import type { Kana } from '../types/kana'

import { useState, useEffect } from 'react'
import { useAppSelector } from '../redux/hooks'
import { selectKana } from '../redux/slices/kana'
import useKanaTyper from '../hooks/useKanaTyper'

import * as KanaUtils from '../utils/kana'
import { getTextWidth } from '../utils/text'


function KanaTest() {
    console.debug('KanaTest')

    const payload = useAppSelector(selectKana)

    const [kana, funcs] = useKanaTyper()
    
    const [inputText, setInputText] = useState<string>('')
    const [index, setIndex] = useState<number>(0)
    const [offset, setOffset] = useState<number>(0)
    const [stats, setStats] = useState(() => ({
        correct: 0,
        incorrect: 0,
    }))

    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const char = KanaUtils.parseRomaji(payload, value.toLowerCase(), 'hiragana')

        // TODO: on romaji "bba" if we type "xtsuba", it will recult in wrong kana on finishing typing "xtsu", because "xtsu" was found as an available symbol.

        // correct char
        if (char.kana === kana[index].kana) {
            console.debug('%c' + '✔ Correct!', 'color: lightgreen')

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
            console.debug('%c' + '✖ Wrong!', 'color: red')

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
            console.debug('%c' + '⏲ Typing...', 'color: yellow')

            setInputText(value)
        }
    }

    useEffect(() => {
        index === 0 || setIndex(0)
        offset === 0 || setOffset(0)
    }, [kana])

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
            <button onClick={funcs.reloadChars}>New</button>
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
