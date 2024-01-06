import dgram from 'node:dgram'

import { createDNSQuery } from './createDNSQuery'
import { parseResponse } from './parseResponse'

export interface DNSRecord {
  domainName: string
  type: number
  rdata: string
  offset: number
}

const client = dgram.createSocket('udp4')
const ROOT_DNS_SERVER = '198.41.0.4'
const DNS_PORT = 53
export const A_RECORD_TYPE = 1
export const AAAA_RECORD_TYPE = 28
export const NS_RECORD_TYPE = 2

function queryDNS(domain: string, server: string) {
  const dnsQuery = createDNSQuery(domain)
  client.send(dnsQuery, DNS_PORT, server, handleError)
}

client.on('message', (message) => {
  handleDNSResponse(message)
})

function handleDNSResponse(message: Buffer) {
  const response = parseResponse(message)
  processDNSResponse(response)
}

function processDNSResponse(response: ReturnType<typeof parseResponse>) {
  const nsRecords = findNSRecords(response.authorityRecords)

  if (nsRecords.length > 0) {
    queryNameServers(nsRecords, response.additionalRecords)
  } else {
    logFinalIPAddresses(response.answerRecords)
  }
}

function findNSRecords(authorityRecords: Array<DNSRecord>) {
  return authorityRecords.filter((rec) => rec.type === NS_RECORD_TYPE)
}

function queryNameServers(
  nsRecords: Array<DNSRecord>,
  additionalRecords: Array<DNSRecord>
) {
  nsRecords.forEach((nsRecord) => {
    const nsIP = findNSIPAddress(nsRecord.rdata, additionalRecords)
    if (nsIP) {
      queryDNS('www.google.com', nsIP) // Replace with the domain you are resolving
    }
  })
}

function findNSIPAddress(
  nsDomainName: string,
  additionalRecords: Array<DNSRecord>
) {
  const record = additionalRecords.find(
    (rec) => rec.domainName === nsDomainName
  )

  return record ? record.rdata : null
}

function logFinalIPAddresses(answerRecords: Array<DNSRecord>) {
  answerRecords.forEach((record) => {
    if (record.type === A_RECORD_TYPE || record.type === AAAA_RECORD_TYPE) {
      console.log(`IP Address found: ${record.rdata}`)
    }
  })
  client.close()
}

function handleError(error: Error | null) {
  if (error) {
    console.error('Error:', error)
    client.close()
  } else {
    console.log(`DNS Query sent to ${ROOT_DNS_SERVER}:${DNS_PORT}`)
  }
}

// Initial Query
queryDNS('www.google.com', ROOT_DNS_SERVER)

client.on('error', (err) => {
  console.log(`Client error: ${err.message}`)
  client.close()
})

client.on('timeout', () => {
  console.log('Request timed out')
  client.close()
})
