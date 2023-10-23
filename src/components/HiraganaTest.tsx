import { useState } from 'react'
import useHiragana from '../hooks/useHiragana'


function HiraganaTest() {
    const [hiragana, setHiragana] = useHiragana()
    const [text, setText] = useState('')

    const updateHiragana = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const char = event.key.length === 1 ? event.key : null

        if (char !== null) {
            const valid = setHiragana.add(char)

            if (valid) {
                setText('')
            }
        }
    }

    return (<>
        <div>{hiragana}</div>
        {/* <button onClick={() => setHiragana.add('kka')}>+</button>
        <button onClick={() => setHiragana.remove()}>-</button> */}
        {/* onKeyDown={(e) => updateHiragana(e)} */}
        <input type="text" name="text" id="text" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => updateHiragana(e)} />
    </>)
}


export default HiraganaTest
