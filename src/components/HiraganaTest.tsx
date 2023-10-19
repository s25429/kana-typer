import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { load as loadHiragana } from '../redux/slices/hiragana'
import useHiragana from '../hooks/useHiragana'


function HiraganaTest() {
    const HIRAGANA = useAppSelector((state) => state.hiragana)
    const dispatch = useAppDispatch()

    const [hiragana, setHiragana] = useHiragana()

    useEffect(() => { dispatch(loadHiragana()) }, [])

    // console.log('siema'.slice(0, -1))

    return (<>
        <div>{hiragana}</div>
        <button onClick={() => setHiragana.add('kka')}>+</button>
        <button onClick={() => setHiragana.remove()}>-</button>
    </>)
}


export default HiraganaTest
