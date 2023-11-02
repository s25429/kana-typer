import useKanaTyper from '../hooks/useKanaTyper'


function KanaTest() {
    console.log('KanaTest')

    const [test] = useKanaTyper()

    // const kana = useAppSelector(selectKana)
    // const kanaStatus = useAppSelector(selectStatus)
    // const func = useKana()

    // const [text, setText] = useState([])

    // useEffect(() => {
    //     setText(func.generateRandom({ hiragana: true }))
    // }, [kanaStatus])

    return (<>
        <span>{''}</span>
        <br />
        <input type="text" name="input" id="input" />
    </>)
}


export default KanaTest
