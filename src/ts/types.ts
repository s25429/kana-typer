export type JSONValue = 
    | string
    | number
    | boolean
    | null
    | JSON[]
    | { [key: string]: JSON }

export type JSO<K extends keyof any, T> = {
    [key in K]: T
}

export type HiraganaUnicodeData = {
    description: string,
    group: string,
    inputs: string[],
    combination: string[]
}

export type HiraganaUnicodeJSO = {
    [key: string]: HiraganaUnicodeData
}
