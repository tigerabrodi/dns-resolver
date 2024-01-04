import { it, expect } from 'vitest'

import { encodeDomainName } from '../encodeDomainName'

it('encodes domain name correctly', () => {
  const domain = 'www.youtube.com'

  const expected = Buffer.from([
    3,
    119,
    119,
    119, // www
    7,
    121,
    111,
    117,
    116,
    117,
    98,
    101, // youtube
    3,
    99,
    111,
    109, // com
    0, // null byte
  ])

  expect(encodeDomainName(domain)).toEqual(expected)
})
