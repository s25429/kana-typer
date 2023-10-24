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

    export interface UnicodeMap {
        hiragana : Kana.UnicodeObject
    }
}