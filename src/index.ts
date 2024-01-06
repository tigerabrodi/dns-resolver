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

function queryDNS(domain: string, server: string) {
  const ipVersion = net.isIP(server)

  // udp4 or udp6 depending on the IP version of the DNS server
  // udp4 for IPv6 will throw EINVAL (invalid argument) exception
  const socketType = ipVersion === 6 ? 'udp6' : 'udp4'

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

    // Close the socket after processing the response
    client.close()
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
  const nsRecords = response.authorityRecords.filter(
    (rec) => rec.type === NS_RECORD_TYPE
  )

  if (nsRecords.length > 0) {
    // Select the first NS record
    const nsRecord = nsRecords[0] as DNSRecord // one NS Record is sufficient to get the IP of the domain, this way we do less queries
    const nsIP = response.additionalRecords.find(
      (rec) => rec.domainName === nsRecord.rdata
    )?.rdata

    if (nsIP) {
      queryDNS(DOMAIN_TO_RESOLVE, nsIP)
    }
  } else {
    // Process A or AAAA records
    const answerRecord = response.answerRecords[0] as DNSRecord
    console.log('IP Address found: ', answerRecord.rdata)
  }
}

// Initial Query
queryDNS(DOMAIN_TO_RESOLVE, ROOT_DNS_SERVER)
