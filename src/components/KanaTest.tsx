import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import useKana from '../hooks/useKana'


function KanaTest() {
    const kana = useAppSelector(state => state.kana.payload)
    const test = useKana()


    return (<>
        <span>hello</span>
    </>)
}


export default KanaTest
