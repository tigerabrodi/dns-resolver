import { encodeDomainName, generateIdentifier } from './utils'

console.log('16 bit buffer', generateIdentifier())

console.log('encoded youtube >>', encodeDomainName('www.youtube.com'))
