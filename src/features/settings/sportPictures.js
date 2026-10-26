import { SPORTS } from './settingsData'

export const SPORT_PICTURES_KEY = 'progressa:sport-pictures:v1'

const SPORT_IDS = new Set(SPORTS.map((sport) => sport.id))
const ICON_NAMES = new Set([...SPORTS.map((sport) => sport.icon), 'activity'])
const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_PIXELS = 40 * 1000 * 1000
const MAX_IMAGE_BYTES = 90 * 1024
const MAX_STORAGE_CHARACTERS = 512 * 1024
const IMAGE_SIZE = 256
const RASTER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isSportId(id) {
  return SPORT_IDS.has(id)
}

export function validateSportPicture(value) {
  if (!isRecord(value)) return null

  if (value.type === 'icon' && ICON_NAMES.has(value.icon)) {
    return { type: 'icon', icon: value.icon }
  }

  if (
    value.type !== 'image' ||
    typeof value.src !== 'string' ||
    value.src.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 32
  )
    return null

  // Only the raster formats produced below are accepted, never URLs or SVG markup.
  const match = /^data:image\/(?:webp|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value.src)
  if (!match || match[1].length % 4 !== 0) return null

  const bytes =
    (match[1].length * 3) / 4 - (match[1].endsWith('==') ? 2 : match[1].endsWith('=') ? 1 : 0)
  return bytes <= MAX_IMAGE_BYTES ? { type: 'image', src: value.src } : null
}

export function readSportPictures(storage) {
  try {
    const saved = (storage ?? window.localStorage).getItem(SPORT_PICTURES_KEY)
    if (!saved) return { pictures: {}, error: null }
    if (saved.length > MAX_STORAGE_CHARACTERS) throw new Error('Invalid picture storage')

    const parsed = JSON.parse(saved)
    if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.pictures)) {
      return {
        pictures: {},
        error: 'Saved sport pictures could not be read. Choose your pictures again.',
      }
    }

    const pictures = {}
    for (const [id, value] of Object.entries(parsed.pictures)) {
      const picture = validateSportPicture(value)
      if (isSportId(id) && picture) pictures[id] = picture
    }

    return { pictures, error: null }
  } catch {
    return {
      pictures: {},
      error:
        'Sport pictures could not be loaded. Check that site storage is allowed in your browser.',
    }
  }
}

export function writeSportPictures(pictures, storage) {
  try {
    if (!isRecord(pictures)) throw new Error('Invalid pictures')

    const clean = {}
    for (const [id, value] of Object.entries(pictures)) {
      const picture = validateSportPicture(value)
      if (!isSportId(id) || !picture) throw new Error('Invalid picture')
      clean[id] = picture
    }

    const saved = JSON.stringify({ version: 1, pictures: clean })
    // localStorage uses UTF-16: keep the whole picture store around one megabyte.
    if (saved.length > MAX_STORAGE_CHARACTERS) {
      return {
        ok: false,
        error: 'There is no more room for sport photos. Remove a photo before adding another.',
      }
    }

    ;(storage ?? window.localStorage).setItem(SPORT_PICTURES_KEY, saved)
    return { ok: true, error: null }
  } catch (error) {
    const full = ['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED'].includes(error?.name)
    return {
      ok: false,
      error: full
        ? 'Your browser is out of storage. Remove a sport photo or free up site storage, then try again.'
        : 'This picture could not be saved. Allow site storage in your browser and try again.',
    }
  }
}

function matches(bytes, offset, text) {
  return [...text].every((character, index) => bytes[offset + index] === character.charCodeAt(0))
}

function imageDimensions(buffer) {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)

  if (bytes.length >= 24 && matches(bytes, 1, 'PNG\r\n\x1a\n') && bytes[0] === 0x89) {
    return { width: view.getUint32(16), height: view.getUint32(20) }
  }

  if (bytes.length >= 10 && (matches(bytes, 0, 'GIF87a') || matches(bytes, 0, 'GIF89a'))) {
    return { width: view.getUint16(6, true), height: view.getUint16(8, true) }
  }

  if (bytes.length >= 25 && matches(bytes, 0, 'RIFF') && matches(bytes, 8, 'WEBP')) {
    if (bytes.length >= 30 && matches(bytes, 12, 'VP8X')) {
      const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16)
      const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16)
      return { width, height }
    }

    if (matches(bytes, 12, 'VP8L') && bytes[20] === 0x2f) {
      const dimensions = view.getUint32(21, true)
      return { width: 1 + (dimensions & 0x3fff), height: 1 + ((dimensions >>> 14) & 0x3fff) }
    }

    if (
      bytes.length >= 30 &&
      matches(bytes, 12, 'VP8 ') &&
      bytes[23] === 0x9d &&
      bytes[24] === 0x01 &&
      bytes[25] === 0x2a
    ) {
      return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff }
    }
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2
    while (offset + 3 < bytes.length) {
      if (bytes[offset] !== 0xff) break
      while (bytes[offset] === 0xff) offset += 1
      const marker = bytes[offset]
      offset += 1
      if (marker === 0xda || marker === 0xd9) break
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
      if (offset + 2 > bytes.length) break

      const length = view.getUint16(offset)
      if (length < 2 || offset + length > bytes.length) break
      const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
      if (isFrame && length >= 7) {
        return { width: view.getUint16(offset + 5), height: view.getUint16(offset + 3) }
      }
      offset += length
    }
  }

  throw new Error('Choose a valid JPG, PNG, WebP or GIF image.')
}

async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    return { image: bitmap, release: () => bitmap.close() }
  }

  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return { image, release: () => URL.revokeObjectURL(url) }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

export async function prepareSportImage(file) {
  if (
    !file ||
    typeof file.arrayBuffer !== 'function' ||
    (file.type && !RASTER_TYPES.has(file.type))
  ) {
    throw new Error('Choose a JPG, PNG, WebP or GIF image.')
  }
  if (file.size > MAX_FILE_BYTES) throw new Error('Choose an image smaller than 10 MB.')
  if (!file.size) throw new Error('This image is empty. Choose another image.')

  // Read dimensions before decoding, so unusually large images never allocate a full bitmap.
  const dimensions = imageDimensions(await file.arrayBuffer())
  if (
    !dimensions.width ||
    !dimensions.height ||
    dimensions.width * dimensions.height > MAX_PIXELS
  ) {
    throw new Error('This image is too large. Choose one with fewer than 40 megapixels.')
  }

  let decoded
  try {
    decoded = await decodeImage(file)
    const { image } = decoded
    const width = image.width || image.naturalWidth
    const height = image.height || image.naturalHeight
    if (!width || !height || width * height > MAX_PIXELS)
      throw new Error('Invalid image dimensions')

    const canvas = document.createElement('canvas')
    canvas.width = IMAGE_SIZE
    canvas.height = IMAGE_SIZE
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image editing is unavailable')

    const side = Math.min(width, height)
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(
      image,
      (width - side) / 2,
      (height - side) / 2,
      side,
      side,
      0,
      0,
      IMAGE_SIZE,
      IMAGE_SIZE,
    )

    for (const quality of [0.84, 0.7, 0.55]) {
      const src = canvas.toDataURL('image/webp', quality)
      if (validateSportPicture({ type: 'image', src })) return src
    }

    // Browsers without WebP encoding can still save an ordinary JPEG.
    context.globalCompositeOperation = 'destination-over'
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE)
    const src = canvas.toDataURL('image/jpeg', 0.7)
    if (validateSportPicture({ type: 'image', src })) return src
    throw new Error('Image could not be compressed')
  } catch {
    throw new Error('This image could not be opened. Try another JPG, PNG, WebP or GIF image.')
  } finally {
    decoded?.release()
  }
}
