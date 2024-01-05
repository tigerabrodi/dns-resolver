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

const A_RECORD_TYPE = 1
const AAAA_RECORD_TYPE = 28

function interpretRData(rdata: Buffer, type: number) {
  switch (type) {
    case A_RECORD_TYPE:
      return interpretIPv4Address(rdata) // IPv4 address, 32 bits or 4 bytes, e.g. `192.168.1.1`
    case AAAA_RECORD_TYPE:
      return interpretIPv6Address(rdata) // IPv6 address, 128 bits or 16 bytes, e.g. `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
    default:
      // For other types, return the data as a hexadecimal string.
      return rdata.toString('hex')
  }
}

function interpretIPv4Address(rdata: Buffer) {
  // Convert the Buffer into an array of numbers. Each number in the array
  // represents a byte of the IPv4 address.
  // For example, if rdata is <Buffer C0 A8 01 01>,
  // it gets converted to [192, 168, 1, 1].
  const ipAddressArray = Array.from(rdata)

  return ipAddressArray.join('.') // Join the array to get a standard IPv4 address.
}

const HEX_BASE = 16

function interpretIPv6Address(rdata: Buffer) {
  const parts: Array<string> = []

  // IPv6 address is 16 bytes long, represented as 8 groups of hexadecimal numbers.
  for (let byteIndex = 0; byteIndex < rdata.length; byteIndex += 2) {
    // Extract two bytes at a time from the buffer.
    // For example, if the first two bytes of rdata are 0x20 and 0x01,
    // then groupValue will be 0x2001.
    const groupValue = rdata.readUInt16BE(byteIndex)

    // Convert the group value to a hexadecimal string.
    // Continuing the example, 0x2001 will be converted to '2001'.
    const hexString = groupValue.toString(HEX_BASE)

    // Append the hexadecimal string to the parts array.
    parts.push(hexString)
  }

  // Join the hexadecimal parts with colons ':' to form a standard IPv6 address notation.
  // For example, ['2001', '0db8', '85a3', ...] will be joined as '2001:0db8:85a3:...'.
  return parts.join(':')
}
