import React from 'react'
import useRandomHiragana from '../hooks/useRandomHiragana'
import useTestAsyncHook from '../hooks/useTestAsyncHook'


function HiraganaTest2() {
    // const [hiragana, generate] = useRandomHiragana()
    const test = useTestAsyncHook()

    const handleInput = (text: string)  => {

    }

    return (<>
        <span>Tutaj bedzie hiragana</span>
        <br />
        <input type="text" name="input" id="input" onChange={(e) => handleInput(e.target.value)} />
        {/* <button onClick={() => generate()}>D</button> */}
    </>)
}


export default HiraganaTest2
