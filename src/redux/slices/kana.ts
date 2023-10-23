import type { RootState } from '../store'
import type { Kana } from '../../types/kana' 

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

import RomajiMap from '../../data/json/romaji-map.json'
import UnicodeMap from '../../data/json/unicode-map.json'


const initialState: Kana.Redux = {
    status: 'pending'
}

export const fetch = createAsyncThunk('kana/fetch', async () => {
    await Promise.resolve('redux kana test').then(v => console.debug(v))
    await new Promise(resolve => setTimeout(resolve, 1000)) // TODO: DEBUG
    return {
        hiragana: {
            romaji: {},
            unicode: {},
            map: {},
        },
        katakana: {
            romaji: {},
            unicode: {},
            map: {},
        },
        kanji: {},
    }
})

export const kanaSlice = createSlice({
    name: 'kana',
    initialState,
    reducers: {},
    extraReducers(builder) { 
        builder
            .addCase(fetch.pending, (state, _) => {
                state.status = 'pending'
                state.error = undefined
                state.payload = undefined
            })
            .addCase(fetch.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                state.error = undefined
                state.payload = action.payload
            })
            .addCase(fetch.rejected, (state, action) => {
                state.status = 'fulfilled'
                state.error = action.payload as string
                state.payload = undefined
            })
    },
})


export const selectKana = (state: RootState) => state.kana.payload

export default kanaSlice.reducer