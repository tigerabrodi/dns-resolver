import type { NS_RECORD_TYPE } from '.'

import { AAAA_RECORD_TYPE, A_RECORD_TYPE } from '.'

export type DNSType =
  | typeof A_RECORD_TYPE
  | typeof AAAA_RECORD_TYPE
  | typeof NS_RECORD_TYPE

export function interpretRDataARecord({
  rdata,
  type,
}: {
  rdata: Buffer
  type: Exclude<DNSType, typeof NS_RECORD_TYPE>
}) {
  switch (type) {
    case A_RECORD_TYPE:
      return interpretIPv4Address(rdata)
    case AAAA_RECORD_TYPE:
      return interpretIPv6Address(rdata)

    default:
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
