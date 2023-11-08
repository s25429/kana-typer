const canvas = document.createElement('canvas')


export const getStyle = (
    elt: HTMLElement, 
    prop: string, 
    pseudoElt: string | null = null
): string => (
    window.getComputedStyle(elt, pseudoElt).getPropertyValue(prop)
)

export const getTextFont = (
    elt: HTMLElement = document.body
): string => {
    const font = {
        weight: getStyle(elt, 'font-weight') || 'normal',
        size: getStyle(elt, 'font-size') || '16px',
        family: getStyle(elt, 'font-family') || 'Times New Roman',
    }

    return `${font.weight} ${font.size} ${font.family}`
}

export const getTextWidth = (
    text: string, 
    parent = document.body
): number => {
    const context = canvas.getContext('2d') as CanvasRenderingContext2D
    context.font = getTextFont(parent)
    return context.measureText(text).width
}
