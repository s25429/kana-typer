import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { fetch as fetchKana, selectStatus } from '../redux/slices/kana'


interface UseKanaOptions {
    autoload : boolean
}


const initialUseKanaOptions = {
    autoload: true
}


function useKana({ autoload }: UseKanaOptions = initialUseKanaOptions) {
    const status = useAppSelector(selectStatus)
    const dispatch = useAppDispatch()


    if (autoload) useEffect(() => {
        if (status === 'pending')
            dispatch(fetchKana())
    }, [status, dispatch])


    return []
}


export default useKana
