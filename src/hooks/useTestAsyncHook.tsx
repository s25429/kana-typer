import React from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { loadHiragana } from '../redux/slices/hiragana'


function useTestAsyncHook() {
    // const HIRAGANA = useAppSelector((state) => state.hiragana)
    // const dispatch = useAppDispatch()

    // dispatch(loadHiragana())

    return []
}


export default useTestAsyncHook
