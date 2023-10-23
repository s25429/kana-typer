import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { increment, decrement, setCounter } from '../redux/counter/counterSlice'


function Counter() {
    const count = useAppSelector((state) => state.counter.value)
    const dispatch = useAppDispatch()

    return (
        <div>
            <button onClick={() => dispatch(increment())}>+</button>
            <span>{count}</span>
            <button onClick={() => dispatch(decrement())}>-</button>
            <br />
            <button onClick={() => dispatch(setCounter(0))}>Set counter to 0</button>
        </div>
    )
}


export default Counter
