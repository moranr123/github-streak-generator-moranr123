/**
 * Download card with format conversion
 */
export async function downloadCard(cardUrl, username, exportFormat) {
  const response = await fetch(cardUrl)
  const blob = await response.blob()
  
  let finalBlob = blob
  let extension = 'png'
  let mimeType = 'image/png'
  
  // Convert to WebP if selected
  if (exportFormat === 'webp') {
    const canvas = document.createElement('canvas')
    const img = new Image()
    const imgUrl = URL.createObjectURL(blob)
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((webpBlob) => {
          if (webpBlob) {
            finalBlob = webpBlob
            extension = 'webp'
            mimeType = 'image/webp'
            URL.revokeObjectURL(imgUrl)
            resolve()
          } else {
            URL.revokeObjectURL(imgUrl)
            reject(new Error('WebP conversion failed'))
          }
        }, 'image/webp', 0.9)
      }
      img.onerror = () => {
        URL.revokeObjectURL(imgUrl)
        reject(new Error('Image load failed'))
      }
      img.src = imgUrl
    })
  } else if (exportFormat === 'svg') {
    const canvas = document.createElement('canvas')
    const img = new Image()
    const imgUrl = URL.createObjectURL(blob)
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        
        const base64 = canvas.toDataURL('image/png')
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${img.width}" height="${img.height}">
          <image width="${img.width}" height="${img.height}" xlink:href="${base64}"/>
        </svg>`
        
        finalBlob = new Blob([svgContent], { type: 'image/svg+xml' })
        extension = 'svg'
        mimeType = 'image/svg+xml'
        URL.revokeObjectURL(imgUrl)
        resolve()
      }
      img.onerror = () => {
        URL.revokeObjectURL(imgUrl)
        reject(new Error('Image load failed'))
      }
      img.src = imgUrl
    })
  }
  
  const url = window.URL.createObjectURL(finalBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `github-streak-${username || 'card'}.${extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
