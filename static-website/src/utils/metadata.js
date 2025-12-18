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
