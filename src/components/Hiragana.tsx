import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loadKana } from '../redux'


function Hiragana() {
    const kana = useSelector((state: any) => state.kana.kana)
    const dispatch = useDispatch()

    // useEffect(() => dispatch(loadKana()), [])

    return (
        <div>lol</div>
    )
}


export default Hiragana
