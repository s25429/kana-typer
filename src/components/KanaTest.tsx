import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { fetch as fetchKana } from '../redux/slices/kana'


function KanaTest() {
    const kana = useAppSelector(state => state.kana.payload)
    const status = useAppSelector(state => state.kana.status)
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(fetchKana())
    }, [])

    return (<>
        <div>{status === 'fulfilled' ? 'T' : 'N'}</div>
        <div>{
            status === 'fulfilled'
                ? kana?.hiragana.romaji ? 'TT' : 'NN'
                : 'N'
        }</div>
    </>)
}


export default KanaTest
