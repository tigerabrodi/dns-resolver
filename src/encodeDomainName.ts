export function encodeDomainName(domain: string) {
  const parts = domain.split('.') // Split the domain into its labels
  const buffers = parts.map((part) => {
    const length = Buffer.from([part.length]) // Create a buffer for the length
    const content = Buffer.from(part, 'ascii') // Create a buffer for the label content
    return Buffer.concat([length, content]) // Combine length and content
  })

  // Combine all parts and add a null byte at the end to signify the end of the domain name
  return Buffer.concat([...buffers, Buffer.from([0])])
}
