import { parseDomainName } from './parseDomainName'

function isResponse(buffer: Buffer) {
  // Extract flags from the second and third byte of the DNS message.
  const flags = buffer.readUInt16BE(2)
  // Check if the response flag (QR bit) is set.
  // This differentiates between a query (0) and a response (1).
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

function parseAnswerRecords(
  buffer: Buffer,
  count: number,
  startOffset: number
) {
  let offset = startOffset
  const records = []

  for (let i = 0; i < count; i++) {
    // Parse the domain name from the current position in the buffer.
    const record = parseDomainName(buffer, offset)
    // The domain name parsing updates the offset to the end of the name.

    // Prepare to read the answer section by moving past the domain name.
    offset = record.offset

    // RDLENGTH specifies the length of the RDATA field and starts 8 bytes after the domain name.
    const dataLength = buffer.readUInt16BE(offset + 8)

    // RDATA is the actual data of the answer record, starting 10 bytes after the domain name.
    // It contains the resource data, like an IP address for A records.
    const rdataStart = offset + 10
    const rdataEnd = rdataStart + dataLength
    const rdata = buffer.slice(rdataStart, rdataEnd)

    // Add the parsed record (domain name and its corresponding RDATA) to the records array.
    records.push({ domainName: record.name, rdata })

    // Update offset for the next iteration to be the end of this record.
    offset = rdataEnd
  }

  return records
}
