export namespace Kana {
    export type Unicode = string
    export type Romaji = string
    export type UnicodeData = {
        description : string
        groups      : string[]
        inputs      : Romaji[]
        combination : Unicode[]
    }

    export interface Payload {
        hiragana : {
            romaji  : { [key : Romaji]  : string      }
            unicode : { [key : Unicode] : UnicodeData }
            map     : { [key : Romaji]  : Unicode     }
        }
        katakana : {
            romaji  : { [key : Romaji]  : string      }
            unicode : { [key : Unicode] : UnicodeData }
            map     : { [key : Romaji]  : Unicode     }
        }
        kanji : {}
    }

    export interface Redux {
        status   : 'pending' | 'fulfilled' | 'rejected'
        error   ?: string
        payload ?: Payload
    }
}
