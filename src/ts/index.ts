import { DEBUG } from './config.js'
import { HIRAGANA, HiraganaChar } from './kana.js'


const textarea = document.querySelector('#textarea') as HTMLElement
const text: HiraganaChar[] = []
const generated: string = generateRandomHiragana()

const keyCode = {
    BACKSPACE: 'Backspace',
    C: 'KeyC'
}

textarea.addEventListener('keydown', (event: KeyboardEvent) => {
    DEBUG && console.log(event)

    // Delete last romaji character
    if (event.code === keyCode.BACKSPACE) {
        if (text.length === 0)
            return

        text[text.length - 1].pop()

        // Pop last element if it is empty
        if (text[text.length - 1].isEmpty)
            text.pop()
    }

    // Clear whole textarea
    else if (event.code === keyCode.C && event.ctrlKey) {
        if (text.length === 0)
            return
        
        textarea.innerHTML = ''
        text.length = 0
    }

    // Manage non-function keys
    else if (event.key.length < 2) {
        let key = event.key.toLowerCase()

        // No items or last item cannot be changed with new chars
        if (text.length < 1 || text[text.length - 1].isFinal) 
            text.push(new HiraganaChar(key))
        else
            text[text.length - 1].append(key)
    }

    textarea.innerHTML = ''
    for (let i = 0; i < text.length; i++) {
        const char: HiraganaChar = text[i]

        if (HiraganaChar.isRomaji(char.value)) {
            textarea.innerHTML += char.value
            continue
        }

        // Color hiragana letters depending if they are correct
        const color: string = char.value === generated[i] ? 'green' : 'red'
        textarea.innerHTML += `<span style="color:${color}">${char.value}</span>`
    }
})

function generateRandomHiragana(): string {
    const wordSize = { min: 8, max: 20 }
    const chars = [...new Set(Object.values(HIRAGANA))]
    const el = document.querySelector('#generated') as HTMLElement

    let text = ''

    for (let i = wordSize.min; i < wordSize.max + 1; i++) {
        let rand = Math.floor(Math.random() * chars.length)
        text += HiraganaChar.hex2symbol(chars[rand])
    }

    el.textContent = text
    return text
}
