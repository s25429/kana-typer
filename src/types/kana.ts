export namespace Kana {
    export type Unicode = string

    export type Romaji = string

    export type RomajiKey = Romaji

    export type Status = 'pending' | 'fulfilled' | 'rejected'

    export type Family = 'hiragana' | 'katakana' | 'kanji'

    export type FamilySum = Family[]

    export interface UnicodeData {
        description : string
        groups      : string[]
        inputs      : Romaji[]
        combination : Unicode[]
    }

    export interface UnicodeDataNew {
        key         : Romaji
        group       : string
        title       : string
        description : string
        type        : string
        small       : boolean
        combination : Unicode[]
    }

    export interface RomajiData {
        family   : string | null  // letter family this romaji coresponds to
        value    : string         // actual romaji value
        type     : {              // what is in that romaji
            gojuon     : boolean
            dakuten    : boolean
            handakuten : boolean
            yoon       : boolean
        }
        variants : { sokuon: boolean, small: boolean } // what can be made from it
        info     : { unused: boolean, extinct: boolean, obsolete: boolean }
    }

    export interface Char {
        kana: string
        romaji: Kana.Romaji
    }
}
