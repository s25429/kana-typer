import { combineReducers } from 'redux'
import kanaReducer from './kana/kanaReducer'


const rootReducer = combineReducers({
    kana: kanaReducer
})


export default rootReducer
