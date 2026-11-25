import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.join(directory, 'data')
const officesFile = path.join(dataDirectory, 'offices.json')
const port = Number(process.env.PORT || 8080)

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(data))
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end(message)
}

function isAllowedOrigin(origin) {
  if (!origin) return true

  try {
    const url = new URL(origin)
    return url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)
  } catch {
    return false
  }
}

async function readOffices() {
  try {
    return JSON.parse(await readFile(officesFile, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

async function readRequestBody(request) {
  let body = ''

  for await (const chunk of request) {
    body += chunk
    if (body.length > 1_000_000) {
      const error = new Error('Request body is too large.')
      error.statusCode = 413
      throw error
    }
  }

  try {
    return JSON.parse(body)
  } catch {
    const error = new Error('Request body must be valid JSON.')
    error.statusCode = 400
    throw error
  }
}

const server = createServer(async (request, response) => {
  const origin = request.headers.origin

  if (!isAllowedOrigin(origin)) {
    sendJson(response, 403, { message: 'Requests from this origin are not allowed.' })
    return
  }

  if (origin) {
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Vary', 'Origin')
  }
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  const officeNumberMatch = url.pathname.match(/^\/api\/office\/deleteByNumber\/([^/]+)$/)
  const officeIdMatch = url.pathname.match(/^\/api\/office\/save\/([^/]+)$/)
  if (url.pathname !== '/api/office/save' && !officeIdMatch && !officeNumberMatch) {
    sendJson(response, 404, { message: 'Endpoint not found.' })
    return
  }

  try {
    if (officeNumberMatch) {
      if (request.method !== 'DELETE') {
        response.setHeader('Allow', 'DELETE, OPTIONS')
        sendJson(response, 405, { message: 'Method not allowed.' })
        return
      }

      const officeNumberValue = officeNumberMatch[1]
      const officeNumber = Number(officeNumberValue)
      if (!/^-?\d+$/.test(officeNumberValue) || !Number.isInteger(officeNumber) ||
          officeNumber < -2147483648 || officeNumber > 2147483647) {
        sendText(response, 400, 'Office number must be a valid integer')
        return
      }

      const offices = await readOffices()
      const officeIndex = offices.findIndex(
        (office) => Number(office.officeNumber) === officeNumber,
      )

      if (officeIndex === -1) {
        sendText(response, 404, 'Office is not found')
        return
      }

      offices.splice(officeIndex, 1)
      await writeFile(officesFile, `${JSON.stringify(offices, null, 2)}\n`, 'utf8')
      sendText(response, 200, 'Office is deleted successfully')
      return
    }

    if (officeIdMatch && request.method === 'DELETE') {
      const officeId = decodeURIComponent(officeIdMatch[1])
      const offices = await readOffices()
      const officeIndex = offices.findIndex((office) => office.id === officeId)

      if (officeIndex === -1) {
        sendJson(response, 404, { message: 'Office not found.' })
        return
      }

      const [deletedOffice] = offices.splice(officeIndex, 1)
      await writeFile(officesFile, `${JSON.stringify(offices, null, 2)}\n`, 'utf8')
      sendJson(response, 200, deletedOffice)
      return
    }

    if (officeIdMatch) {
      response.setHeader('Allow', 'DELETE, OPTIONS')
      sendJson(response, 405, { message: 'Method not allowed.' })
      return
    }

    if (request.method === 'GET') {
      sendJson(response, 200, await readOffices())
      return
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST, OPTIONS')
      sendJson(response, 405, { message: 'Method not allowed.' })
      return
    }

    const office = await readRequestBody(request)
    const name = typeof office.name === 'string' ? office.name.trim() : ''
    const officeNumber = typeof office.officeNumber === 'string' ? office.officeNumber.trim() : ''

    if (!name || !officeNumber) {
      sendJson(response, 400, { message: 'Office name and office number are required.' })
      return
    }

    const offices = await readOffices()
    const savedOffice = {
      id: randomUUID(),
      name,
      officeNumber,
      createdAt: new Date().toISOString(),
    }
    offices.push(savedOffice)

    await mkdir(dataDirectory, { recursive: true })
    await writeFile(officesFile, `${JSON.stringify(offices, null, 2)}\n`, 'utf8')
    sendJson(response, 201, savedOffice)
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      message: error.statusCode ? error.message : 'The office could not be saved.',
    })
    if (!error.statusCode) console.error('Office API error:', error)
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Office API listening at http://localhost:${port}`)
})
