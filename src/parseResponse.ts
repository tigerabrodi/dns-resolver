import { interpretRData } from './interpretRData'
import { parseDomainName } from './parseDomainName'

function isResponse(buffer: Buffer) {
  // Extract flags from the second and third byte of the DNS message.
  const flags = buffer.readUInt16BE(2)
  // Check if the response flag (QR bit) is set.
  // This differentiates between a query (0) and a response (1).
  // Also called masking
  return (flags & 0x8000) !== 0 // 0x8000 is 10000000 00000000 in binary.
}

export function parseResponse(buffer: Buffer) {
  if (!isResponse(buffer)) {
    throw new Error('Not a DNS response.')
  }

  // Extract relevant information from the DNS message header.
  const transactionID = buffer.readUInt16BE(0) // First 2 bytes are the transaction ID.
  const questionsCount = buffer.readUInt16BE(4) // Number of questions.
  const answersCount = buffer.readUInt16BE(6) // Number of answers.

  // Parsing starts after the 12-byte header.
  const offset = 12
  const question = parseDomainName(buffer, offset)
  // Move offset past the question section, which includes QTYPE and QCLASS.
  const answerRecordsOffset = question.offset + 4

  // Parse each answer in the response.
  const answerRecords = parseAnswerRecords(
    buffer,
    answersCount,
    answerRecordsOffset
  )

  return {
    transactionID,
    questionsCount,
    answersCount,
    questionName: question.name,
    answerRecords,
  }
}

interface DNSRecord {
  domainName: string
  type: number
  rdata: string
}

function parseAnswerRecords(
  buffer: Buffer,
  count: number,
  startOffset: number
): Array<DNSRecord> {
  let offset = startOffset
  const records: Array<DNSRecord> = []

  for (let i = 0; i < count; i++) {
    const record = parseDomainName(buffer, offset)
    offset = record.offset

    const typeOfRecord = buffer.readUInt16BE(offset + 2)
    const dataLength = buffer.readUInt16BE(offset + 8)
    const rdataStart = offset + 10
    const rdata = buffer.slice(rdataStart, rdataStart + dataLength)

    const parsedRecord: DNSRecord = {
      domainName: record.name,
      type: typeOfRecord,
      rdata: interpretRData(rdata, typeOfRecord),
    }

    records.push(parsedRecord)
    offset = rdataStart + dataLength
  }

  return records
}
