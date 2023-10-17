import React, { useEffect } from 'react'
// import { connect } from 'react-redux'
import { useSelector, useDispatch } from 'react-redux'
import { loadKana } from '../redux'


function useHiragana() {
    useEffect(() => { loadKana() }, [])

    const kana = useSelector((state: any) => state.kana.kana)
    const dispatch = useDispatch()

    return [kana, () => dispatch(loadKana())]
}


export default useHiragana
