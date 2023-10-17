import React from 'react'
import useKanaText from '../hooks/useKanaText'


const KanaInput = () => {
    const [kana, setKana] = useKanaText()

    return (<>
        <div>{kana.kana}</div>
        <input type="text" value={kana.romaji} onChange={(e) => {
            setKana(e.target.value)
            console.log(kana)
        }} />
    </>)
}


export default KanaInput