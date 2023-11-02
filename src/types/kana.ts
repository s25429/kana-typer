export namespace Kana {
    export type Unicode = string

    export type Romaji = string

    export type Status = 'pending' | 'fulfilled' | 'rejected'

    export type Family = 'hiragana' | 'katakana' | 'kanji'

    export type FamilySum = Family[]

    export interface UnicodeData {
        description : string
        groups      : string[]
        inputs      : Romaji[]
        combination : Unicode[]
    }

    export interface Char {
        kana: string
        romaji: Kana.Romaji
    }
}
