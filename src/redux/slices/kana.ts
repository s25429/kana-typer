import type { RootState } from '../store'
import type { Kana } from '../../types/kana' 
import type { JSON } from '../../types/json'

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'


interface RomajiObject {
    [key : Kana.Romaji] : string
}

interface UnicodeObject {
    [key : Kana.Unicode] : Kana.UnicodeData
}

interface MapObject {
    [key : Kana.Romaji] : Kana.Unicode
}

interface Payload {
    hiragana : {
        romaji  : RomajiObject
        unicode : UnicodeObject
        map     : MapObject
    }
    katakana : {
        romaji  : RomajiObject
        unicode : UnicodeObject
        map     : MapObject
    }
    kanji : {
        romaji  : RomajiObject
        unicode : UnicodeObject
        map     : MapObject
    }
}


interface KanaState {
    status   : Kana.Status
    error   ?: string
    payload ?: Payload
}


const initialState: KanaState = {
    status: 'pending'
}

const fetchJSON = async (path: string) => await axios.get(path).then(res => res.data)

const getRomajiInputs = (data: JSON.RomajiMapData): RomajiObject => (
    Object
        .entries(data.used)
        .reduce((acc: RomajiObject, [group, inputs]: [string, Kana.Romaji[]]) => (
            inputs.length
                ? { 
                    ...acc, 
                    ...inputs.reduce((acc2, input) => ({ ...acc2, [input]: group }), {})
                }
                : acc
        ), {})
)

const getUnicodes = (data: UnicodeObject): UnicodeObject => ({ ...data })

const getKanaMap = (data: UnicodeObject): MapObject => (
    Object
        .entries(data)
        .reduce((acc: MapObject, [code, data]: [Kana.Unicode, Kana.UnicodeData]) => (
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

export const fetchKana = createAsyncThunk('kana/fetch', async () => {
    await Promise.resolve('redux thunk for kana loading').then(v => console.debug(v))
    await new Promise(resolve => setTimeout(resolve, 1000)) // TODO: DEBUG

    const romajiMap: JSON.RomajiMap = await fetchJSON('json/romaji-map.json')
    const unicodeMap: JSON.UnicodeMap = await fetchJSON('json/unicode-map.json')

    const ret: Payload = {
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
        kanji: {
            romaji: {},
            unicode: {},
            map: {},
        },
    }

    return ret
})

export const kanaSlice = createSlice({
    name: 'kana',
    initialState,
    reducers: {},
    extraReducers(builder) { 
        builder
            .addCase(fetchKana.pending, (state, _) => {
                state.status = 'pending'
                state.error = undefined
                state.payload = undefined
            })
            .addCase(fetchKana.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                state.error = undefined
                state.payload = action.payload
            })
            .addCase(fetchKana.rejected, (state, action) => {
                state.status = 'fulfilled'
                state.error = action.payload as string ?? 'Unknown Error'
                state.payload = undefined
            })
    },
})


export type KanaReduxPayload = Payload | undefined


export const selectKana = (state: RootState) => state.kana.payload
export const selectStatus = (state: RootState) => state.kana.status
export const selectError = (state: RootState) => state.kana.error

export default kanaSlice.reducer