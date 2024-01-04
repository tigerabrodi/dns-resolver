import type { ErrorResponse, SuccessResponse } from './types'

import { Socket } from 'node:net'
import * as readline from 'readline'

const options = {
  port: 8080,
  host: 'localhost',
}

const client = new Socket()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false, // Disable automatic line output by readline to prevent echo
})

client.connect(options, () => {
  console.log('Connected to server!')
  promptUser()
})

const promptUser = () => {
  process.stdout.write('Enter command: ')
}

rl.on('line', (line) => {
  if (line === 'quit') {
    client.write('quit')
  } else {
    client.write(line)
  }
})

client.on('data', (data) => {
  const stringifiedData = JSON.parse(data.toString()) as
    | SuccessResponse
    | ErrorResponse

  if (stringifiedData.status === 'OK') {
    switch (stringifiedData.type) {
      case 'set':
      case 'flushall': {
        console.log('OK')
        break
      }

      case 'quit': {
        console.log('Server closed the connection')
        rl.close()
        client.destroy()
        return
      }

      case 'get':
      case 'del':
      case 'keys':
      case 'exists':
      case 'lpush':
      case 'rpush':
      case 'lpop':
      case 'rpop':
      case 'lrange':
      case 'sadd':
      case 'smembers':
      case 'srem': {
        console.log(stringifiedData.data)
        break
      }
    }
  }

  if (stringifiedData.status === 'ERROR') {
    console.log(stringifiedData.data)
  }

  promptUser()
})

client.on('close', () => {
  console.log('Connection closed')
  rl.close()
  process.exit(0)
})

client.on('error', (err) => {
  console.error('An error occurred:', err)
  process.exit(1)
})
