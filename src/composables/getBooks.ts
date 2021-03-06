import { $fetch } from 'ohmyfetch'

export type raw = Record<string, resultModel>

interface errModel {
  msg: string
  source?: string
}
interface resultModel {
  success: boolean
  books?: bookInfo[]
  err?: errModel
}

interface bookInfo {
  id?: string
  name: string
  url: string
  authors?: string[]
  publishers?: string[]
  date?: string
  fileType?: string
  language?: string
  fileSize?: string
}

export async function getBooks(name: string, provider: string|string[]): Promise<raw> {
  try {
    return await getBooksWithTimeout(name, provider, 11000)
  } catch (ex) {
    let errText = 'Unknown'
    if (typeof ex === 'string')
      errText = ex
    else if (ex instanceof Error)
      errText = ex.message

    if (errText.startsWith('The user aborted a request.'))
      errText = 'Timeout'

    const emptyRcd: Record<string, resultModel> = {}
    if (typeof provider === 'string') {
      emptyRcd[provider] = { success: false, err: { msg: errText, source: 'front end requester' } }
    } else {
      provider.forEach((_x) => {
        if (_x !== 'a')
          emptyRcd[_x] = { success: false, err: { msg: errText, source: 'front end requester' } }
      })
    }
    return emptyRcd
  }
}

async function getBooksWithTimeout(name: string, provider: string|string[], timeout: number): Promise<raw> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const rst = await $fetch(
    'https://api.boocat.org/api/AllBooks',
    {
      method: 'GET',
      params: { name, provider },
      parseResponse: JSON.parse,
      signal: controller.signal,
    },
  )
  clearTimeout(id)
  return rst
}
