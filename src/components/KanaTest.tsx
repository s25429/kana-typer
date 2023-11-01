import { useEffect } from 'react'
import { useAppSelector } from '../redux/hooks'
import { selectKana } from '../redux/slices/kana'
import useKana from '../hooks/useKana'


function KanaTest() {
    const kana = useAppSelector(selectKana)
    const test = useKana()


    return (<>
        <span>hello</span>
    </>)
}


export default KanaTest
