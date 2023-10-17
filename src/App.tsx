// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import { Provider } from 'react-redux';
import store from './redux/store'

import Counter from './components/Counter';

// https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#consistent-components-exports


function App() {
    return (
        <Provider store={store}>
            <Counter />
        </Provider>
    )
}


export default App
