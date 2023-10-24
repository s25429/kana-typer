export namespace Kana {
    export type Unicode = string
    export type Romaji = string
    export type UnicodeData = {
        description : string
        groups      : string[]
        inputs      : Romaji[]
        combination : Unicode[]
    }

    export interface RomajiObject {
        [key : Romaji] : string
    }

    export interface UnicodeObject {
        [key : Unicode] : UnicodeData
    }

    export interface MapObject {
        [key : Romaji]  : Unicode
    }

    export interface Payload {
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
        kanji : {}
    }

    export interface Redux {
        status   : 'pending' | 'fulfilled' | 'rejected'
        error   ?: string
        payload ?: Payload
    }
}
