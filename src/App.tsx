// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import { Provider } from 'react-redux'
import store from './redux/store'
import KanaTest from './components/KanaTest'

// import Counter from './components/Counter'
// import HiraganaTest from './components/HiraganaTest'
// import HiraganaTest2 from './components/HiraganaTest2'

// https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#consistent-components-exports


function App() {
    return (
        <Provider store={store}>
            <KanaTest />

            {/* <Counter /> */}
            {/* <HiraganaTest /> */}
            {/* <HiraganaTest2 /> */}
        </Provider>
    )
}


export default App
