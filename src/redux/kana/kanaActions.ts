import RomajiMap from '../../data/new/romaji-map.json'
import UnicodeMap from '../../data/new/unicode-map.json'
import { LOAD_KANA } from './kanaTypes'


export const loadKana = () => {
    let romaji = [
        ...RomajiMap.hiragana.gojuuon,
        ...RomajiMap.hiragana.dakuten,
        ...RomajiMap.hiragana.youon,
        ...RomajiMap.hiragana.youonDakuten,
    ]

    let unicode = UnicodeMap.hiragana

    let input = {}
    Object.entries(UnicodeMap.hiragana).map(([code, data]) => {
        data.inputs.length === 0 || data.inputs.forEach((inputKey) => {
            input = { ...input, [inputKey]: code }
        })
    })

    return {
        type: LOAD_KANA,
        payload: { romaji, unicode, input },
    }
    // return (dispatch: AnyAction) => {
    //     dispatch(loadKanaRequest())

    //     let romaji = [
    //         ...RomajiMap.hiragana.gojuuon,
    //         ...RomajiMap.hiragana.dakuten,
    //         ...RomajiMap.hiragana.youon,
    //         ...RomajiMap.hiragana.youonDakuten,
    //     ]

    //     let unicode = UnicodeMap.hiragana

    //     let input = {}
    //     Object.entries(UnicodeMap.hiragana).map(([code, data]) => {
    //         data.inputs.length === 0 || data.inputs.forEach((inputKey) => {
    //             input = { ...input, [inputKey]: code }
    //         })
    //     })

    //     dispatch(loadKanaSuccess({
    //         romaji,
    //         unicode,
    //         input,
    //     }))
    // }
}
