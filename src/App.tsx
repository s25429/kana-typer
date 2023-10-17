// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import KanaInput from './components/KanaInput'
import { loadKanaFromJson, KanaText } from './utils/kana'
import useHiragana from './hooks/useHiragana'
import { Provider } from 'react-redux';
import store from './redux/store'

// https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#consistent-components-exports


function App() {
    return (
        <Provider store={store}>
            hello world
        </Provider>
    )
}


export default App
