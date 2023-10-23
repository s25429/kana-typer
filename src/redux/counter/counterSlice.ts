import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'


interface CounterState {
    value: number
}


const initialState: CounterState = {
    value: 0,
} // as CounterState // if typing is too strict


export const setCounter = createAsyncThunk('counter/set', async (value: number) => {
    await Promise.resolve(() => console.log(value))
    return value
})


export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1
        },
        decrement: (state) => {
            state.value -= 1
        },
        incrementByAmount: (state, action: PayloadAction<number>) => {
            state.value += action.payload
        },
    },
    extraReducers(builder) {
        builder
            .addCase(setCounter.fulfilled, (state, action) => {
                state.value = action.payload
            })
    }
})


export const { increment, decrement, incrementByAmount } = counterSlice.actions
export const selectCount = (state: RootState) => state.counter.value // Other code such as selectors can use imported `RootState` type

export default counterSlice.reducer
