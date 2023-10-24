import type { RootState } from '../store'
import type { Kana } from '../../types/kana' 
import type { JSON } from '../../types/json'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'


const initialState: Kana.Redux = {
    status: 'pending'
}

const fetchJSON = async (path: string) => await axios.get(path).then(res => res.data)

const getRomajiInputs = (data: JSON.RomajiMapData): Kana.RomajiObject => (
    Object
        .entries(data.used)
        .reduce((acc: Kana.RomajiObject, [group, inputs]: [string, Kana.Romaji[]]) => (
            inputs.length
                ? { 
                    ...acc, 
                    ...inputs.reduce((acc2, input) => ({ ...acc2, [input]: group }), {})
                }
                : acc
        ), {})
)

const getUnicodes = (data: Kana.UnicodeObject): Kana.UnicodeObject => ({ ...data })

const getKanaMap = (data: Kana.UnicodeObject): Kana.MapObject => (
    Object
        .entries(data)
        .reduce((acc: Kana.MapObject, [code, data]: [Kana.Unicode, Kana.UnicodeData]) => (
            data.inputs.length
                ? { 
                    ...acc, 
                    ...data.inputs.reduce((acc2, input: Kana.Romaji) => (
                        { ...acc2, [input]: code }
                    ), {})
                }
                : acc
        ), {})
)

export const fetch = createAsyncThunk('kana/fetch', async () => {
    await Promise.resolve('redux kana test').then(v => console.debug(v))
    await new Promise(resolve => setTimeout(resolve, 1000)) // TODO: DEBUG

    const romajiMap: JSON.RomajiMap = await fetchJSON('json/romaji-map.json')
    const unicodeMap: JSON.UnicodeMap = await fetchJSON('json/unicode-map.json')

    const ret: Kana.Payload = {
        hiragana: {
            romaji: getRomajiInputs(romajiMap.hiragana),
            unicode: getUnicodes(unicodeMap.hiragana),
            map: getKanaMap(unicodeMap.hiragana),
        },
        katakana: {
            romaji: {},
            unicode: {},
            map: {},
        },
        kanji: {},
    }

    return ret
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
export const selectStatus = (state: RootState) => state.kana.status
export const selectError = (state: RootState) => state.kana.error

export default kanaSlice.reducer