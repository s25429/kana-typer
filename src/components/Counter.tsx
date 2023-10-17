import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { increment, decrement } from '../redux/counter/counterSlice'


function Counter() {
    const count = useAppSelector((state) => state.counter.value)
    const dispatch = useAppDispatch()

    return (
        <div>
            <button onClick={() => dispatch(increment())}>+</button>
            <span>{count}</span>
            <button onClick={() => dispatch(decrement())}>-</button>
        </div>
    )
}


export default Counter
