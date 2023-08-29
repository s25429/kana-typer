async function fetchFile(path: string) {
    const response = await fetch(path)
    const json = await response.json()
    return json
}


export { fetchFile }
