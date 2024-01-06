export function parseDomainName(buffer: Buffer, offset: number) {
  let name = ''
  let hasEncounteredPointer = false
  let originalOffset = offset

  while (true) {
    const lengthByte = buffer[offset] // This is the prefix byte indicating the length of the label

    if (isEndOfName(lengthByte)) {
      offset = offset + 1 // Move past the null byte indicating the end of the name
      break
    }

    if (isPointerIndicator(lengthByte)) {
      if (!hasEncounteredPointer) {
        originalOffset = offset + 2 // Set originalOffset to position after the pointer
        hasEncounteredPointer = true
      }
      offset = calculatePointerOffset(lengthByte, buffer, offset)
      continue
    }

    const label = readLabel(buffer, offset, lengthByte)
    name = name + label + '.' // Append label and a dot to the name
    offset = offset + lengthByte + 1 // Update offset to the position after the current label
  }

  // If we encountered a pointer, it means `offset` jumped elsewhere. `originalOffset` is the position right after the pointer, where we want to continue parsing. Don't get this wrong, it's not the pointer itself or the position the pointer points to, but the position right after the pointer.
  return {
    domainName: name,
    newOffset: hasEncounteredPointer ? originalOffset : offset,
  }
}

function isEndOfName(lengthByte: number) {
  // The end of the domain name is indicated by a null byte (0x00).
  // Binary: 00000000
  return lengthByte === 0
}

function isPointerIndicator(lengthByte: number) {
  // A pointer is indicated by the first two bits being set (11).
  // Comparison is done using 0xC0 (11000000 in binary) which is a hex.
  // For example, if lengthByte is 0xC2 (11000010 in binary),
  // (lengthByte & 0xC0) results in 0xC0 (11000000), indicating a pointer.
  return (lengthByte & 0xc0) === 0xc0
}

function calculatePointerOffset(
  lengthByte: number,
  buffer: Buffer,
  currentOffset: number
) {
  // Masking the first two bits (11) and shifting left by 8 bits.
  // Shifting left by 8 bits means we now have 8 bits of zeros on the right.
  // 8 bits on the right is additional room to calculcate the offset.
  // A pointer is 16 bits (2 bytes) long, with the first two bits being 11.
  // The first two simply indicate that it is a pointer.
  // Also why we need to mask, because they are not part of the offset.

  // Example: lengthByte 0xDA (11011010 in binary)
  // After (lengthByte & 0x3F): 0x1A (00011010)
  // After shifting: 0x1A00 (00011010 00000000)
  // Combine with next byte (say, 0x5B) using bitwise OR: 0x1A5B (00011010 01011011)

  // In human language:
  // 1. Remove the first two bits (11) from the first byte.
  // 2. Move rest of bits to the left by 8 bits.
  // 3. Moving now means we have 8 bits of zeros on the right.
  // 4. We now have in total 16 bits (2 bytes) to calculate the offset.
  // 5. Needed because a pointer is 16 bits (2 bytes) long.
  // 6. `lengthByte` represents the entire first byte which we masked: `11011010` -> `00011010`.
  // 7. `buffer[currentOffset + 1]` represents the next byte (next 8 bits). This is the one we have to combine with the first byte. We do so using bitwise OR.
  // 8. OR works as follows: 1 OR 1 = 1, 1 OR 0 = 1, 0 OR 1 = 1, 0 OR 0 = 0.
  // 9. Essentially, wherever there is a 1, the result is 1. Wherever there is a 0, the result is 0.
  return ((lengthByte & 0x3f) << 8) | buffer[currentOffset + 1]
}

function readLabel(buffer: Buffer, offset: number, length: number) {
  // The offset points to the length byte of the label in the buffer.
  // Therefore, the actual label starts 1 byte after the offset.
  const startOfLabel = offset + 1

  // The end of the label is calculated by adding the length of the label
  // to the starting position. The length specifies how many characters
  // the label has.
  const endOfLabel = startOfLabel + length

  // Extracting the label from the buffer.
  // buffer.toString('ascii', start, end) converts the bytes between 'start'
  // and 'end' positions in the buffer to an ASCII string.
  // Example: If the buffer has [3, 'w', 'w', 'w'] at positions 5, 6, 7, 8,
  // and offset is 5, length is 3, it reads 'www' starting from position 6 to 8.
  return buffer.toString('ascii', startOfLabel, endOfLabel)
}
