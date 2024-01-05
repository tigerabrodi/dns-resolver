import { expect, it } from 'vitest'

import { parseDomainName } from '../parseDomainName'

it('should parse domain name correctly', () => {
  const buffer = Buffer.from([
    0x03, 0x77, 0x77, 0x77, 0x07, 0x79, 0x6f, 0x75, 0x74, 0x75, 0x62, 0x65,
    0x03, 0x63, 0x6f, 0x6d, 0x00,
  ])
  const offset = 0 // Starting at the beginning of the buffer

  const expected = { name: 'www.youtube.com.', offset: 17 } // The expected result

  expect(parseDomainName(buffer, offset)).toEqual(expected)
})
