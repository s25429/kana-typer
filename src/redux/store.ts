import { configureStore } from '@reduxjs/toolkit'

import counterReducer from './counter/counterSlice'


const store = configureStore({
    reducer: {
        counter: counterReducer
    },
})


export type RootState = ReturnType<typeof store.getState> // Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}

export default store
