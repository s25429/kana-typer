import type { RootState } from '../store'
import type { Kana } from '../../types/kana' 
import type { JSON } from '../../types/json'

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'


interface RomajiObject {
    [key : Kana.Romaji] : Kana.RomajiData
}

interface UnicodeObject {
    [key : Kana.Unicode] : Kana.UnicodeDataNew
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

const getRomajiInputs = (data: RomajiObject): RomajiObject => (
    Object
        .entries(data)
        .reduce((
            acc: RomajiObject, 
            [romaji, data]: [Kana.Romaji, Kana.RomajiData]
        ) => (
            !data.info.unused && !data.info.extinct && !data.info.obsolete
                ? { ...acc, [romaji]: data }
                : acc
        ), {})
)

const getUnicodes = (data: UnicodeObject, romaji: RomajiObject): UnicodeObject => (
    Object
        .entries(data)
        .reduce((
            acc: UnicodeObject,
            [code, data]: [Kana.Unicode, Kana.UnicodeDataNew]
        ) => (
            romaji[data.key] !== undefined
                ? { ...acc, [code]: data }
                : acc
        ), {})
)

const getKanaMap = (unicodes: UnicodeObject, romaji: RomajiObject): MapObject => (
    Object
        .entries(unicodes)
        .reduce((
            acc: MapObject,
            [code, data]: [Kana.Unicode, Kana.UnicodeDataNew]
        ) => ({ 
            ...acc, 
            [(data.small ? 'x' : '') + romaji[data.key]?.value]: code
        }), {})
)

export const fetchKana = createAsyncThunk('kana/fetch', async () => {
    await Promise.resolve('redux thunk for kana loading').then(v => console.log(v))
    await new Promise(resolve => setTimeout(resolve, 1000)) // TODO: DEBUG

    const romajiMap: JSON.RomajiMapNew = await fetchJSON('json/romaji-map-new.json')
    const unicodeMap: JSON.UnicodeMapNew = await fetchJSON('json/unicode-map-new.json')

    const romajiData = getRomajiInputs(romajiMap.hiragana)
    const unicodeData = getUnicodes(unicodeMap.hiragana, romajiData)
    const mapData = getKanaMap(unicodeData, romajiData)

    const ret: Payload = {
        hiragana: {
            romaji: romajiData,
            unicode: unicodeData,
            map: mapData,
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