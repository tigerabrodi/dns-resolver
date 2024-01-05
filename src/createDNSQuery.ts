import { encodeDomainName } from './encodeDomainName'
import { generateIdentifier } from './generateIdentifier'

export function createDNSQuery(
  domain: string,
  identifier = generateIdentifier()
) {
  // DNS Header Parts
  const flags = Buffer.from([0x01, 0x00]) // Standard query with recursion
  const questionCount = Buffer.from([0x00, 0x01]) // One question
  const answerRR = Buffer.from([0x00, 0x00]) // No answer resource records
  const authorityRR = Buffer.from([0x00, 0x00]) // No authority resource records
  const additionalRR = Buffer.from([0x00, 0x00]) // No additional resource records

  // DNS Question Parts
  const encodedDomain = encodeDomainName(domain) // Encoded domain name
  const type = Buffer.from([0x00, 0x01]) // Query type (A record)
  const classBuffer = Buffer.from([0x00, 0x01]) // Query class (IN)

  const query = Buffer.concat([
    identifier, // Unique identifier for the query
    flags, // Flags indicating the nature of the query
    questionCount, // Indicates one question in the query
    answerRR, // Number of answers (none in this query)
    authorityRR, // Number of authority records (none in this query)
    additionalRR, // Number of additional records (none in this query)
    encodedDomain, // The domain name being queried
    type, // Type of query (A record)
    classBuffer, // Class of query (IN - Internet)
  ])

  return query
}
