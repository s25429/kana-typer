import type { Kana } from './kana'


export namespace JSON {
    export type Value = 
        | string
        | number
        | boolean
        | null
        | Value[]
        | { [key : string] : Value }
    
    export interface Object {
        [key : string]: Value
    }

    export interface Array extends globalThis.Array<Value> {}

    export interface RomajiMapData {
        used : {
            gojuon      : Kana.Romaji[]
            dakuten     : Kana.Romaji[]
            yoon        : Kana.Romaji[]
            yoonDakuten : Kana.Romaji[]
        }
        obsolete ?: {
            gojuon      ?: Kana.Romaji[]
            dakuten     ?: Kana.Romaji[]
            yoon        ?: Kana.Romaji[]
            yoonDakuten ?: Kana.Romaji[]
        }
    }

    export interface RomajiMap {
        hiragana : RomajiMapData
    }

    export interface RomajiMapNew {
        hiragana : { [key : Kana.Romaji] : Kana.RomajiData }
    }

    export interface UnicodeMap {
        hiragana : { [key : Kana.Unicode] : Kana.UnicodeData }
    }

    export interface UnicodeMapNew {
        hiragana : { [key : Kana.Unicode] : Kana.UnicodeDataNew }
    }
}