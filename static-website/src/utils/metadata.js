const decodeBase64Json = (base64String) => {
  try {
    const jsonString = decodeURIComponent(escape(window.atob(base64String)))
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Failed to decode metadata', error)
    return null
  }
}

export const dataUriToJson = (uri) => {
  if (!uri) return null
  if (uri.startsWith('data:application/json;base64,')) {
    return decodeBase64Json(uri.split(',')[1])
  }
  if (uri.startsWith('data:application/json;utf8,')) {
    try {
      return JSON.parse(uri.split(',')[1])
    } catch {
      return null
    }
  }
  return null
}

export const encodeMetadataToDataUri = (metadata) => {
  const jsonString = JSON.stringify(metadata)
  const utf8Bytes = new TextEncoder().encode(jsonString)
  let binaryString = ''
  utf8Bytes.forEach((byte) => {
    binaryString += String.fromCharCode(byte)
  })
  const base64Metadata = window.btoa(binaryString)
  return `data:application/json;base64,${base64Metadata}`
}

const ipfsToHttp = (uri) =>
  uri.startsWith('ipfs://')
    ? `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`
    : uri

export const fetchMetadataFromUri = async (uri) => {
  if (!uri) return null

  // Fast-path for embedded data URIs
  const embedded = dataUriToJson(uri)
  if (embedded) return embedded

  const resolved = ipfsToHttp(uri)
  if (!resolved.startsWith('http')) return null

  try {
    const res = await fetch(resolved)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch metadata from URI', uri, error)
    return null
  }
}
