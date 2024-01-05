import { expect, it } from 'vitest'

import { interpretRData } from '../interpretRData'

it('should interpret rdata for type 1, A records', () => {
  const rdata = Buffer.from([192, 168, 1, 1]) // Sample IPv4 address in buffer format
  const type = 1 // A Record type

  const expected = '192.168.1.1' // Expected IPv4 address

  expect(interpretRData(rdata, type)).toBe(expected)
})

it('should interpret rdata for type 28, AAAA records', () => {
  const rdata = Buffer.from([
    32, 1, 13, 184, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  ]) // Sample IPv6 address in buffer format
  const type = 28 // AAAA Record type

  // Expected IPv6 address in unshortened format
  const expected = '2001:db8:0:800:0:0:0:1'

  expect(interpretRData(rdata, type)).toBe(expected)
})
