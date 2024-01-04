import crypto from 'crypto'

export function generateIdentifier() {
  return crypto.randomBytes(2) // Generates a 2-byte (16-bit) buffer
}
