import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

import RomajiMap from '../../data/json/romaji-map.json'
import UnicodeMap from '../../data/json/unicode-map.json'


type UnicodeNumber = string
type Romaji = string
type KanaUnicodeData = {
    description : string
    groups      : string[]
    inputs      : Romaji[]
    combination : UnicodeNumber[]
} 

interface KanaState {
    romaji  : Romaji[]
    unicode : { [key : UnicodeNumber] : KanaUnicodeData }
    input   : { [key : Romaji]        : UnicodeNumber   }
}


const initialState: KanaState = {
    romaji: [],
    unicode: {},
    input: {}
}

export const hiraganaSlice = createSlice({
    name: 'hiragana',
    initialState,
    reducers: {
        load: (state) => {
            let romajiArrays = Object.values(RomajiMap.hiragana.used)
            state.romaji = [ ...romajiArrays.flat(1) ]

            let unicodeObj = UnicodeMap.hiragana
            state.unicode = { ...unicodeObj }

            let inputObj: KanaState['input'] = {}
            Object.entries(UnicodeMap.hiragana)
                .map(([code, data]: [UnicodeNumber, KanaUnicodeData]) => (
                    data.inputs.length === 0 || data.inputs.forEach((input: Romaji) => {
                        inputObj = { ...inputObj, [input]: code }
                    })
                ))
            state.input = { ...inputObj }
        },
    },
})

export const { load } = hiraganaSlice.actions
export const selectHiragana = (state: RootState) => state.hiragana

export default hiraganaSlice.reducer
