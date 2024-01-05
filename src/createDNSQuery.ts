import { encodeDomainName } from './encodeDomainName'
import { generateIdentifier } from './generateIdentifier'

export function createDNSQuery(
  domain: string,
  identifier = generateIdentifier()
) {
  // Set flags: 0x0100 for standard query with recursion
  const flags = Buffer.from([0x01, 0x00])

  // Encode the domain name
  const encodedDomain = encodeDomainName(domain)

  // Set query type and class (both 0x0001 for A record and IN class)
  const type = Buffer.from([0x00, 0x01])
  const classBuffer = Buffer.from([0x00, 0x01])

  // Assemble the question count, answer RR, authority RR, and additional RR (all zero except question count), because we're only asking a question, not answering it
  const questionCount = Buffer.from([0x00, 0x01])
  const answerRR = Buffer.from([0x00, 0x00])
  const authorityRR = Buffer.from([0x00, 0x00])
  const additionalRR = Buffer.from([0x00, 0x00])

  // Create the complete DNS query message
  const query = Buffer.concat([
    identifier,
    flags,
    questionCount,
    answerRR,
    authorityRR,
    additionalRR,
    encodedDomain,
    type,
    classBuffer,
  ])

  return query
}
