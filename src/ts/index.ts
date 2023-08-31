import { DEBUG } from './config.js'
import preload from './preload.js'
import { KeyManager, Kana, HiraganaChar } from './kana.js'


await preload()


switch (getScriptVersion()) {
    case 1: ver1(); break
    case 2: ver2(); break
    default: ver2()
}



function ver1() {
    const source = document.querySelector('#kana-container #source') as HTMLElement
    const target = document.querySelector('#kana-container #target') as HTMLElement
    
    const sourceText: HiraganaChar[] = generateRandomHiragana({ max: 200 })
    const targetText: HiraganaChar[] = []


    source.textContent = sourceText.map(char => char.value).join('')

    target.addEventListener('keydown', (event: KeyboardEvent) => {
        DEBUG && console.debug(event, '\n', targetText)

        // Delete last romaji character
        if (KeyManager.isKey('bs', event)) {
            if (targetText.length === 0)
                return

                targetText[targetText.length - 1].pop()

            // Pop last element if it is empty
            if (targetText[targetText.length - 1].isEmpty) {
                targetText.pop()
            }
        }

        // Clear whole textarea
        else if (KeyManager.isKey('dl', event)) {
            if (targetText.length === 0)
                return
            
            target.innerHTML = ''
            targetText.length = 0
        }

        else if (KeyManager.isKey('ctrl+c', event)) {
            const range = document.createRange()
            range.selectNode(target)
            window.getSelection()?.removeAllRanges()
            window.getSelection()?.addRange(range)

            try {
                document.execCommand('copy')
                console.log('Text copied to clipboard:', target.textContent)
            }
            catch (error) {
                console.error('Copy failed:', error)
            }
        }

        // Manage non-function keys
        else if (KeyManager.isKey('non-function-keys', event)) {
            let key = event.key.toLowerCase()

            // No items or last item cannot be changed with new chars
            if (targetText.length === 0 || targetText[targetText.length - 1].isFinal) {
                targetText.push(new HiraganaChar(key))
            }
            else {
                targetText[targetText.length - 1].append(key)
            }
        }

        target.innerHTML = ''
        for (let i = 0; i < targetText.length; i++) {
            const char: HiraganaChar = targetText[i]

            if (HiraganaChar.isRomaji(char.value)) {
                target.innerHTML += char.value
                continue
            }

            // Color hiragana letters depending if they are correct
            const color: string = char.value === sourceText[i].value ? 'green' : 'red'
            target.innerHTML += `<span style="color:${color}">${char.value}</span>`
        }
    })


    function generateRandomHiragana(
        { min, max }
        : { min?: number, max?: number } 
        = {}
    ): HiraganaChar[] {
        const romajiChars: string[] = Kana.ALL_HIRAGANA_TEST

        if (romajiChars.length === 0) {
            console.error(`Unable to generate text with empty hiragana map`)
            return []
        }

        let hiragana: HiraganaChar[] = []
        // const wordSize = { min: 8, max: 20 }

        for (let i = (min ?? 1); i < (max ?? 2) + 1; i++) {
            let rand = Math.floor(Math.random() * romajiChars.length)
            hiragana.push(new HiraganaChar(romajiChars[rand]))
        }

        return hiragana
    }
}


function ver2() {
    const textarea = document.querySelector('#kana-container .typer') as HTMLElement
    const genEl = document.querySelector('#kana-container .text') as HTMLElement


    const text: HiraganaChar[] = []
    const generated: HiraganaChar[] = generateRandomHiragana()
    const fontWidth: number = getKanaFontWidth()
    let index = 0
    let offset = 0
    let direction: -1 | 0 | 1 = 0


    textarea.addEventListener('keydown', (event: KeyboardEvent) => {
        DEBUG && console.log(event, '\n', text, '\n', generated)
        direction = 0

        console.log(index, text.length - 1)

        // Delete last romaji character
        if (KeyManager.isKey('bs', event)) {
            if (text.length === 0)
                return

            text[text.length - 1].pop()

            // Pop last element if it is empty
            if (text[text.length - 1].isEmpty) {
                text.pop()
                direction = -1
            }

            index = text.length -1

            if (index < 0)
                index = 0
        }

        // Clear whole textarea
        else if (KeyManager.isKey('ctrl-c', event)) {
            if (text.length === 0)
                return
            
            textarea.innerHTML = ''
            text.length = 0
        }

        // Manage non-function keys
        else if (KeyManager.isKey('non-function-keys', event)) {
            let key = event.key.toLowerCase()

            // No items or last item cannot be changed with new chars
            if (text.length === 0 || text[text.length - 1].isFinal) {
                if (text.length === 0) index = 0
                else                   index++

                text.push(new HiraganaChar(key))
            }
            else {
                text[text.length - 1].append(key)
            }

            direction = 1
        }

        // Print chars
        let newTextarea = ''
        let char = text[index]
        let orig = generated[index]

        if (char !== undefined) {
            // Typed a hiragana character
            if (char.isFinal || char.isValid && orig.isN) {
                textarea.innerHTML = 'type...'
                const el = genEl.children[index] as HTMLElement

                // Valid character
                if (char.value === orig.value) {
                    el.style.color = 'green'
                }

                // Invalid character
                else {
                    el.style.color = 'red'
                }

                if (direction !== 0) {
                    offset += el.offsetWidth / fontWidth * direction
                    genEl.style.cssText = `
                        transform: translateX(calc(
                            var(--initial-pos) - var(--font-size) * ${offset}
                        )); 
                        transition: transform .1s linear;`
                }
            }

            // Did not finish typing
            else {
                textarea.innerHTML = char.value
            }
        }

        else {
            textarea.innerHTML = 'type...'
        }


        // for (let i = 0; i < text.length; i++) {
        //     const char: HiraganaChar = text[i]
        //     if (HiraganaChar.isRomaji(char.value)) {
        //         newTextarea += char.value
        //         continue
        //     }

        //     // Color hiragana letters depending if they are correct
        //     let color: string = 'red'

        //     if (char.value === generated[i].value) {
        //         color = 'green'
        //         // TODO: does not work ...
        //         // const offset: number = (genEl.children[i] as HTMLElement)?.offsetWidth ?? 0
        //         // const prev: number = parseFloat(genEl.style.left)
        //         // genEl.style.left = `${prev - offset}px`
        //     }

        //     newTextarea += `<span style="color:${color}">${char.value}</span>`
        // }

        // textarea.innerHTML = newTextarea === '' ? 'type' : newTextarea
    })


    function generateRandomHiragana(): HiraganaChar[] {
        const romajiChars: string[] = Kana.ALL_HIRAGANA_TEST

        if (romajiChars.length === 0) {
            console.error(`Unable to generate text with empty hiragana map`)
            return []
        }

        let hiragana: HiraganaChar[] = []
        let text = ''
        const wordSize = { min: 8, max: 20 }
        const el = document.querySelector('#kana-container .text') as HTMLElement

        for (let i = wordSize.min; i < wordSize.max + 1; i++) {
            let rand = Math.floor(Math.random() * romajiChars.length)
            let char = new HiraganaChar(romajiChars[rand])

            hiragana.push(char)
            text += char.isFinal ? `<span>${char.value}</span>` : ''
        }

        el.innerHTML = text
        return hiragana
    }


    function getKanaFontWidth(): number {
        const fontSize = 4  // rem
        const fontFamily = 'Noto Sans JP'
        const char = HiraganaChar.hex2symbol(Kana.hiragana('a') ?? '61')

        const canvas =  document.createElement('canvas')
        const context = canvas.getContext('2d') as CanvasRenderingContext2D

        context.font = `${fontSize}rem ${fontFamily}`
        return context.measureText(char).width
    }
}


function getScriptVersion(): number {
    const scriptUrl = new URL(import.meta.url)
    const queryParams = new URLSearchParams(scriptUrl.search)
    return parseInt(queryParams.get('version') ?? '0')
}
