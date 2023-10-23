import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
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
    romaji  : { [key : Romaji]        : string }
    unicode : { [key : UnicodeNumber] : KanaUnicodeData }
    input   : { [key : Romaji]        : UnicodeNumber   }
}


const initialState: KanaState = {
    romaji: {},
    unicode: {},
    input: {},
}


export const loadHiragana = createAsyncThunk('hiragana/load', async () => {
    let romajiObj: KanaState['romaji'] = {}
    Object.entries(RomajiMap.hiragana.used).forEach(([group, inputs]: [string, Romaji[]]) => {
        inputs.length && inputs.forEach((input: Romaji) => {
            romajiObj = { ...romajiObj, [input]: group }
        })
    })

    let unicodeObj: KanaState['unicode'] = UnicodeMap.hiragana

    let inputObj: KanaState['input'] = {}
    Object.entries(UnicodeMap.hiragana).forEach(([code, data]: [UnicodeNumber, KanaUnicodeData]) => {
        data.inputs.length && data.inputs.forEach((input: Romaji) => {
            inputObj = { ...inputObj, [input]: code }
        })
    })

    return { romaji: romajiObj, unicode: unicodeObj, input: inputObj }
})


export const hiraganaSlice = createSlice({
    name: 'hiragana',
    initialState,
    reducers: {
        // load: (state) => {
        //     let romajiObj = {}
        //     Object.entries(RomajiMap.hiragana.used)
        //         .forEach(([group, inputs]: [string, Romaji[]]) => {
        //             inputs.length && inputs.forEach((input: Romaji) => {
        //                 romajiObj = { ...romajiObj, [input]: group }
        //             })
        //         })
        //     state.romaji = { ...romajiObj }

        //     let unicodeObj = UnicodeMap.hiragana
        //     state.unicode = { ...unicodeObj }

        //     let inputObj = {}
        //     Object.entries(UnicodeMap.hiragana)
        //         .forEach(([code, data]: [UnicodeNumber, KanaUnicodeData]) => {
        //             data.inputs.length && data.inputs.forEach((input: Romaji) => {
        //                 inputObj = { ...inputObj, [input]: code }
        //             })
        //         })
        //     state.input = { ...inputObj }
        // },
    },
    extraReducers(builder) {
        builder.addCase(loadHiragana.fulfilled, (state, action) => ({
            ...state, 
            ...action.payload
        }))
    }
})

// export const { load } = hiraganaSlice.actions
export const selectHiragana = (state: RootState) => state.hiragana

export default hiraganaSlice.reducer
