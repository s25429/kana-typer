import RomajiMap from '../data/new/romaji-map.json'
import UnicodeMap from '../data/new/unicode-map.json'
import { JSONValue } from './types'


const loadJson = (path: string): JSONValue => {
    if (path === 'unicode')
        return JSON.parse(JSON.stringify(UnicodeMap)) // TODO: otherwise compiler shouts

    if (path === 'romaji')
        return JSON.parse(JSON.stringify(RomajiMap)) // TODO: otherwise compiler shouts

    else {
        console.warn(`loadJson: path=${path} - Not implemented`)
        return {}
    }
}


export { loadJson }
