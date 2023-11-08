import type { Kana } from '../types/kana'

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { fetchKana, selectStatus, selectKana } from '../redux/slices/kana'

import * as KanaUtils from '../utils/kana'
import { getTextWidth } from '../utils/text'


/**
 * Load profile of this prototype:
 *   - initial components load
 *     - rerender
 *   - useEffect launched (dependency array initialized)
 *     - kanaStatus === pending => load redux store
 *   - kana was updated (redux store finished loading)
 *     - rerender
 *   - useEffect launched (dependency array change detected)
 *     - kanaStatus === fulfilled => dispatched set state action on chars
 *   - (mysterious rerender is somewhere here)
 *   - chars were updated with new value
 *     - rerender
 * Total: 3 of 4 rerenders
 * Missing: 1 mysterious rerender
 */


function useKanaTyper(): [Kana.Char[], React.Dispatch<React.SetStateAction<Kana.Char[]>>] {
    console.log(useKanaTyper.name)

    const kana = useAppSelector(selectKana)
    const kanaStatus = useAppSelector(selectStatus)
    const kanaDispatch = useAppDispatch()

    const [chars, setChars] = useState<Kana.Char[]>([])

    /**
     * Calculates the optimal length of generated kana so that more kana can be later generated before user sees the end of it. Greater fill value on initial load is recommended.
     * @param fill - how much size (in percentage) of the actual screen width should characters take
     * @returns an estimated amount of chars to generate
     */
    const getOptimalLength = (fill: number = 0.75) => {
        const char = kana 
            ? KanaUtils.unicodeHexToSymbol(kana.hiragana.map['a'])
            : 'あ'
        const elt = document.querySelector('.kana') || document.body
        const charWidth = getTextWidth(char, elt as HTMLElement)
        const windowWidth = window.innerWidth // TODO: does not include devtools win
        return Math.ceil(windowWidth / charWidth * fill)
    }

    const reloadChars = () => {
        setChars(KanaUtils.generateRandom({ 
            payload: kana, 
            family: ['hiragana'], 
            length: getOptimalLength(1)
        }))
    }

    const appendChars = (fill: number = 0.75) => {
        setChars(prevChars => ([
            ...prevChars,
            ...KanaUtils.generateRandom({ 
                payload: kana, 
                family: ['hiragana'], 
                length: getOptimalLength(fill)
            })
        ]))
    }

    useEffect(() => {
        console.log(`useEffect from ${useKanaTyper.name} `)

        if (kanaStatus === 'pending')
            kanaDispatch(fetchKana())

        if (kanaStatus === 'fulfilled')
            reloadChars()
    }, [kanaStatus, kanaDispatch])

    return [chars, setChars]
}


export default useKanaTyper
