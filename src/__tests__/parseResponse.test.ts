import { expect, it } from 'vitest'

import { parseResponse } from '../parseResponse'

const testBufferForARecord: Buffer = Buffer.from([
  0x00,
  0x00, // Transaction ID
  0x81,
  0x80, // Flags
  0x00,
  0x01, // Questions
  0x00,
  0x01, // Answer RRs
  0x00,
  0x00, // Authority RRs
  0x00,
  0x00, // Additional RRs
  // Query
  0x03,
  0x77,
  0x77,
  0x77, // 'www'
  0x07,
  0x65,
  0x78,
  0x61,
  0x6d,
  0x70,
  0x6c,
  0x65, // 'example'
  0x03,
  0x63,
  0x6f,
  0x6d, // 'com'
  0x00, // Null byte
  0x00,
  0x01, // Type A
  0x00,
  0x01, // Class IN
  // Answer
  0xc0,
  0x0c, // Name (pointer to 'www.example.com')
  0x00,
  0x01, // Type A
  0x00,
  0x01, // Class IN
  0x00,
  0x00,
  0x00,
  0x3c, // TTL
  0x00,
  0x04, // Data length
  0x5d,
  0xb8,
  0xd8,
  0x22, // IP Address (93.184.216.34)
])

const expectedOutputTestForARecord = {
  header: {
    transactionID: 0,
    questionsCount: 1,
    answersCount: 1,
    authorityCount: 0,
    additionalCount: 0,
  },
  questionName: 'www.example.com.',
  answerRecords: [
    {
      domainName: 'www.example.com.',
      type: 1,
      rdata: '93.184.216.34',
      offset: 49,
    },
  ],
  authorityRecords: [],
  additionalRecords: [],
}

it('should parse A Record response', () => {
  expect(parseResponse(testBufferForARecord)).toEqual(
    expectedOutputTestForARecord
  )
})

const testNSRecordBuffer: Buffer = Buffer.from([
  // DNS Header
  0x00,
  0x01, // Transaction ID
  0x81,
  0x80, // Flags
  0x00,
  0x01, // Questions
  0x00,
  0x00, // Answer RRs
  0x00,
  0x01, // Authority RRs
  0x00,
  0x00, // Additional RRs
  // Question Section
  0x07,
  0x65,
  0x78,
  0x61,
  0x6d,
  0x70,
  0x6c,
  0x65, // 'example'
  0x03,
  0x63,
  0x6f,
  0x6d, // 'com'
  0x00, // Null byte
  0x00,
  0x02, // Type NS
  0x00,
  0x01, // Class IN
  // Authority Section
  0xc0,
  0x0c, // Name (pointer to 'example.com')
  0x00,
  0x02, // Type NS
  0x00,
  0x01, // Class IN
  0x00,
  0x00,
  0x00,
  0x3c, // TTL
  0x00,
  0x17, // Data length (23 bytes)
  // NS Record Data
  0x03,
  0x6e,
  0x73,
  0x31, // 'ns1'
  0x07,
  0x65,
  0x78,
  0x61,
  0x6d,
  0x70,
  0x6c,
  0x65, // 'example'
  0x03,
  0x63,
  0x6f,
  0x6d, // 'com'
  0x00, // Null byte
])

const expectedNSRecordOutput = {
  header: {
    transactionID: 1,
    questionsCount: 1,
    answersCount: 0,
    authorityCount: 1,
    additionalCount: 0,
  },
  questionName: 'example.com.',
  answerRecords: [],
  authorityRecords: [
    {
      domainName: 'example.com.',
      type: 2, // NS record type
      rdata: 'ns1.example.com.', // NS record data
      offset: 58, // This would be the offset after parsing the NS record
    },
  ],
  additionalRecords: [],
}

it('should parse NS record response correctly', () => {
  const result = parseResponse(testNSRecordBuffer)
  expect(result).toEqual(expectedNSRecordOutput)
})
