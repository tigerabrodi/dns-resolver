import crypto from 'crypto'

export function generateIdentifier() {
  return crypto.randomBytes(2) // Generates a 2-byte (16-bit) buffer
}

export function encodeDomainName(domain: string) {
  // Split the domain name into its labels (parts between the dots)
  return (
    domain
      .split('.')
      .map((part) => {
        // For each label, we create a Buffer with its length and concatenate the label itself.
        // Buffer.from([part.length]) creates a buffer with a single byte representing the length of the label.
        // This byte is prefixed to the label, thus representing the length-prefix format required by DNS.
        return `${Buffer.from([part.length])}${part}`
      })
      .join('') + '00'
  ) // Join all the parts together and append '00' at the end
  // The '00' at the end represents the null byte, which indicates the end of the domain name.
}
