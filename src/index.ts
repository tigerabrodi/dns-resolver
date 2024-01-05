import dgram from 'node:dgram'

import { createDNSQuery } from './createDNSQuery'
import { parseResponse } from './parseResponse'

// Create a UDP client
const client = dgram.createSocket('udp4')

const YOUTUBE_DOMAIN = 'www.youtube.com'
const dnsQuery = createDNSQuery(YOUTUBE_DOMAIN)

// Root DNS server details
const ROOT_DNS_SERVER = '198.41.0.4' // A root name server
const DNS_PORT = 53

// Send the DNS query
client.send(dnsQuery, DNS_PORT, ROOT_DNS_SERVER, (error) => {
  if (error) {
    client.close()
    throw error
  }
  console.log(`DNS Query sent to ${ROOT_DNS_SERVER}:${DNS_PORT}`)
})

// Handle the response
client.on('message', (msg, info) => {
  console.log('Received response from DNS server:\n')
  console.log('Message:', msg.toString('hex')) // Hexadecimal representation of the message
  console.log('Info:', info)
  console.log(
    'Received %d bytes from %s:%d\n',
    msg.length,
    info.address,
    info.port
  )

  console.log('THIS IS THE RESPONSE', parseResponse(msg))

  client.close()
})

// TODO: Handle errors
client.on('error', (err) => {
  console.log(`Client error: ${err.message}`)
  client.close()
})

// TODO: handle timeout if the server doesn't respond
client.on('timeout', () => {
  console.log('Request timed out')
  client.close()
})
