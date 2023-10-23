import { configureStore } from '@reduxjs/toolkit'

import counterReducer from './counter/counterSlice'
import hiraganaReducer from './slices/hiragana'
import kanaReducer from './slices/kana'


const store = configureStore({
    reducer: {
        counter: counterReducer,
        hiragana: hiraganaReducer,
        kana: kanaReducer,
    },
})


export type RootState = ReturnType<typeof store.getState> // Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}

export default store
