import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { load as loadHiragana } from '../redux/slices/hiragana'
import useHiragana from '../hooks/useHiragana'


function HiraganaTest() {
    const HIRAGANA = useAppSelector((state) => state.hiragana)
    const dispatch = useAppDispatch()

    const [hiragana, setHiragana] = useHiragana()

    useEffect(() => { dispatch(loadHiragana()) }, [])

    // console.log([1, 2, 3].slice(0, -1), [1, 2, 3].slice(-1), [].slice(-1))
    // console.log([1, 2, 3].slice(0, -1))
    console.log(['jeden', 'dwa', 'trzy'].slice(-1).pop()?.slice(0, -1))

    return (<>
        <div>{hiragana}</div>
        <button onClick={() => setHiragana.add('kka')}>+</button>
        <button onClick={() => setHiragana.remove()}>-</button>
    </>)
}


export default HiraganaTest
