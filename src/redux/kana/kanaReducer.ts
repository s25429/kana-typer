import { PayloadAction } from '@reduxjs/toolkit'
import { LOAD_KANA } from './kanaTypes'


// interface KanaState {
//     loading: boolean,
//     kana?: any[],
//     error?: string,
// }

const initialState = {
    loading: false,
    kana: [],
    error: '',
}


const kanaReducer = (
    state = initialState, 
    action: PayloadAction<any>
) => {
    switch (action.type) {
        case LOAD_KANA: return {
            ...state,
            kana: state.kana
        }

        default: return state
    }
}


export default kanaReducer
