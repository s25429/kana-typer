import type { Kana } from '../types/kana'

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { fetchKana, selectStatus, selectKana } from '../redux/slices/kana'

import * as KanaUtils from '../utils/kana'


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


function useKanaTyper() {
    console.log('useKanaTyper')

    const kana = useAppSelector(selectKana)
    const kanaStatus = useAppSelector(selectStatus)
    const kanaDispatch = useAppDispatch()

    const [chars, setChars] = useState<Kana.Char[]>([])

    useEffect(() => {
        console.log('useEffect')
        
        if (kanaStatus === 'pending')
            kanaDispatch(fetchKana())

        if (kanaStatus === 'fulfilled')
            setChars(KanaUtils.generateRandom({ 
                payload: kana, 
                family: ['hiragana'], 
                length: 8 
            }))
    }, [kanaStatus, kanaDispatch])

    return [chars]
}


export default useKanaTyper
