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

export type KanaUnicodeData = {
    description : string,
    group       : string,
    inputs      : string[],
    combination : string[],
}

export type KanaUnicodeJSO = {
    [key: string]: KanaUnicodeData
}

export type KanaArgs = {
    filepath           ?: string, 
    key                 : 'hiragana' | 'katakana',
    asMap               : boolean,
    descriptionsFilter ?: string[], 
    groupsFilter       ?: string[], 
    inputsFilter       ?: string[], 
    combinationsFilter ?: string[], 
}

export type KanaArgsOld = {
    filepath           ?: string, 
    descriptionsFilter ?: string[], 
    groupsFilter       ?: string[], 
    inputsFilter       ?: string[], 
    combinationsFilter ?: string[], 
}

export type KanaFilters = {
    descriptions : string[], 
    groups       : string[], 
    inputs       : string[], 
    combinations : string[], 
}

export type KeyCode = string
