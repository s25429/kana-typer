import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { load as loadHiragana } from '../redux/slices/hiragana'
import useHiragana from '../hooks/useHiragana'


function HiraganaTest() {
    const HIRAGANA = useAppSelector((state) => state.hiragana)
    const dispatch = useAppDispatch()

    const [hiraganaText, hiraganaFn] = useHiragana()

    useEffect(() => { dispatch(loadHiragana()) }, [])

    return (<>
        <div>{hiraganaText}</div>
        <button onClick={() => hiraganaFn.add('a')}>+</button>
        <button onClick={() => hiraganaFn.remove()}>-</button>
    </>)
}


export default HiraganaTest
