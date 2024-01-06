import type { DNSRecord } from '.'
import type { DNSType } from './interpretRDataARecord'

import { interpretRDataARecord } from './interpretRDataARecord'
import { parseDomainName } from './parseDomainName'

import { NS_RECORD_TYPE } from '.'

interface Header {
  transactionID: number
  questionsCount: number
  answersCount: number
  authorityCount: number
  additionalCount: number
}

export function parseResponse(buffer: Buffer) {
  if (!isResponse(buffer)) {
    throw new Error('Not a DNS response.')
  }

  const header = parseHeader(buffer)
  let offset = 12 // Start after the header
  const question = parseQuestionSection(buffer, offset)
  offset = question.newOffset + 4 // Move past question section

  const answerRecords = parseSections(buffer, header.answersCount, offset)
  offset = updateOffset(answerRecords, offset)
  const authorityRecords = parseSections(buffer, header.authorityCount, offset)
  offset = updateOffset(authorityRecords, offset)
  const additionalRecords = parseSections(
    buffer,
    header.additionalCount,
    offset
  )

  const finalResponse = {
    header,
    questionName: question.domainName,
    answerRecords,
    authorityRecords,
    additionalRecords,
  }

  return finalResponse
}

function isResponse(buffer: Buffer) {
  const flags = buffer.readUInt16BE(2)
  return (flags & 0x8000) !== 0
}

function parseHeader(buffer: Buffer): Header {
  const header = {
    transactionID: buffer.readUInt16BE(0),
    questionsCount: buffer.readUInt16BE(4),
    answersCount: buffer.readUInt16BE(6),
    authorityCount: buffer.readUInt16BE(8),
    additionalCount: buffer.readUInt16BE(10),
  }

  return header
}

function parseQuestionSection(buffer: Buffer, offset: number) {
  const question = parseDomainName(buffer, offset)

  return question
}

function parseSections(buffer: Buffer, count: number, startOffset: number) {
  let offset = startOffset
  const records = []

  for (let i = 0; i < count; i++) {
    const record = parseRecord(buffer, offset)
    records.push(record)
    offset = record.offset
  }

  return records
}

function parseRecord(buffer: Buffer, offset: number): DNSRecord {
  const domainNameData = parseDomainName(buffer, offset)
  offset = domainNameData.newOffset

  const type = buffer.readUInt16BE(offset) as DNSType
  offset += 2 // Move past the type field

  offset += 2 // Skip class field (2 bytes)
  offset += 4 // Skip TTL field (4 bytes)

  const dataLength = buffer.readUInt16BE(offset)
  offset += 2 // Move past the data length field

  const rdataBuffer = buffer.slice(offset, offset + dataLength)

  let rdata: string

  if (type === NS_RECORD_TYPE) {
    const { domainName, newOffset } = parseDomainName(buffer, offset)
    offset = newOffset
    rdata = domainName
  } else {
    rdata = interpretRDataARecord({
      rdata: rdataBuffer,
      type,
    })
    offset += dataLength // Update offset to the end of rdata
  }

  return {
    domainName: domainNameData.domainName,
    type,
    rdata,
    offset,
  }
}

function updateOffset(records: Array<DNSRecord>, currentOffset: number) {
  return records.length > 0 ? records[records.length - 1].offset : currentOffset
}
