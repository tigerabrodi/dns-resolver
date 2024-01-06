import dgram from 'node:dgram'
import net from 'node:net'

import { createDNSQuery } from './createDNSQuery'
import { parseResponse } from './parseResponse'

export interface DNSRecord {
  domainName: string
  type: number
  rdata: string
  offset: number
}

const ROOT_DNS_SERVER = '198.41.0.4'
const DNS_PORT = 53
export const A_RECORD_TYPE = 1
export const AAAA_RECORD_TYPE = 28
export const NS_RECORD_TYPE = 2
const DOMAIN_TO_RESOLVE = 'www.google.com'

function queryDNS(domain: string, server: string, isInitialQuery = false) {
  console.log(`Querying ${server} for ${domain}`)
  console.log('-----------------------------------', isInitialQuery)

  // Determine if the server address is IPv4 or IPv6
  const ipVersion = net.isIP(server)
  console.log('ipVersion', ipVersion)
  const socketType = ipVersion === 6 ? 'udp6' : 'udp4'

  // Create a new socket for this query
  const client = dgram.createSocket(socketType)

  const dnsQuery = createDNSQuery(domain)

  client.send(dnsQuery, DNS_PORT, server, (error) => {
    if (error) {
      console.error('Error sending DNS query:', error)
      client.close()
    } else {
      console.log(`DNS Query sent to ${server}:${DNS_PORT}`)
    }
  })

  client.on('message', (message) => {
    const response = parseResponse(message)
    processDNSResponse(response)
    client.close() // Close the socket after processing the response
  })

  client.on('error', (err) => {
    console.error(`Client error: ${err.message}`)
    client.close()
  })

  client.on('timeout', () => {
    console.log('Request timed out')
    client.close()
  })
}

function processDNSResponse(response: ReturnType<typeof parseResponse>) {
  response.authorityRecords
    .filter((rec) => rec.type === NS_RECORD_TYPE)
    .forEach((nsRecord) => {
      const nsIP = response.additionalRecords.find(
        (rec) => rec.domainName === nsRecord.rdata
      )?.rdata

      console.log('nsIP', nsIP)

      if (nsIP) {
        queryDNS(DOMAIN_TO_RESOLVE, nsIP) // Replace with the domain you are resolving
      }
    })

  if (response.authorityRecords.length === 0) {
    response.answerRecords
      .filter(
        (rec) => rec.type === A_RECORD_TYPE || rec.type === AAAA_RECORD_TYPE
      )
      .forEach((record) => console.log(`IP Address found: ${record.rdata}`))
  }
}

// Initial Query
queryDNS(DOMAIN_TO_RESOLVE, ROOT_DNS_SERVER, true)
