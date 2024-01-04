import { expect, it } from 'vitest'

import { createDNSQuery } from '../createDNSQuery'

it('creates DNS query correctly', () => {
  const domain = 'www.youtube.com'
  const identifier = Buffer.from([0x68, 0x90]) // Use a fixed identifier for testing

  const expected = Buffer.from([
    0x68,
    0x90, // Identifier
    0x01,
    0x00, // Flags
    0x00,
    0x01, // Question count
    0x00,
    0x00, // Answer RR
    0x00,
    0x00, // Authority RR
    0x00,
    0x00, // Additional RR
    0x03,
    0x77,
    0x77,
    0x77, // www
    0x07,
    0x79,
    0x6f,
    0x75,
    0x74,
    0x75,
    0x62,
    0x65,
    0x03,
    0x63,
    0x6f,
    0x6d, // youtube
    0x00, // null byte
    0x00,
    0x01, // Type
    0x00,
    0x01, // Class
  ])

  expect(createDNSQuery(domain, identifier)).toEqual(expected)
})
