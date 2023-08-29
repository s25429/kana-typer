async function fetchFile(path: string): Promise<any> {
    const response: Response = await fetch(path)
    const json: any = await response.json()
    return json
}


export { fetchFile }
