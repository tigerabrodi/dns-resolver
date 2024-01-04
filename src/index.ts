import { encodeDomainName } from './encodeDomainName'
import { generateIdentifier } from './generateIdentifier'

console.log('16 bit buffer', generateIdentifier())

console.log('encoded youtube >>', encodeDomainName('www.youtube.com'))
