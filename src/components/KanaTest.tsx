import { useState } from 'react'
import useKanaTyper from '../hooks/useKanaTyper'

import * as KanaUtils from '../utils/kana'


function KanaTest() {
    console.log('KanaTest')

    const [kana, funcs] = useKanaTyper()
    const [inputText, setInputText] = useState('')

    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        
    }

    return (<>
        <span>{KanaUtils.charsToString(kana)}</span>
        <br />
        <input type="text" value={inputText} onChange={handleInputOnChange} />
        <button onClick={funcs.reloadChars}>🔃</button>
    </>)
}


export default KanaTest
