# DNS Resolver from scratch

Basic DNS Resolver from scratch. The current code resolves Google's domain.

## How to try it

Clone it.

Run `npm install`.

Now run `npm run start`.

This is what you should see. It's resolving Google's domain.

![Screenshot 2024-01-06 at 15 40 05](https://github.com/narutosstudent/dns-resolver/assets/49603590/7b4445bd-8916-4bd4-9e11-a019747215d9)

If you encounter issues, feel free to raise them.

Contributions are open! 💞

## TODO

CNAME records (Canonical Name records), not handled yet. I might get around to it later. **This will require a recursive query similar to how we deal with NS Records.** CNAME records are used in DNS to create an alias from one domain name to another. This is useful for scenarios like hosting multiple services (like mail, FTP, etc.) on a single IP address, where each service can have its own entry in DNS, and all of them point to the same IP address using CNAME records.

- [ ] CNAME Records

## Flowchart

I was thinking of doing a flowchart, but I think this video from [ByteByteGo](https://www.youtube.com/watch?v=27r4Bzuj5NQ) explains everything amazingly.

# Debugging stories

## offset of NS Record is wrong

How we deal with parsing NS Record types is different. I handled most of it but got stuck around the offset value. The offset I initially had was too large, It was 64 despite the buffer having a size of 58.

At first, I was a bit confused because the number was close. Maybe I'm on the right track lol? And the way I dealt with getting the name and type for NS Record was right too.

I added a failing test. The good part was I knew the Buffer size, so the offset should end there (58).

I ran the test with JS debug terminal in VS code. Set a breakpoint. Stepped through it.

After a while I discovered where we parse the domain name, we return the correct offset!!

It all clicked. How we deal with A Records' offsets we can't do with NS Records. For A records, we add the data length `offset += dataLength`. The data here however is the IP address, and not a new domain to query.

![Screenshot 2024-01-06 at 08 24 11](https://github.com/narutosstudent/dns-resolver/assets/49603590/1117ccf6-481b-4cd0-9bca-d3ec27758a7d)


## Udp4 sockets returning error for IpV6 address

I ran into this error when doing recursive queries. It only happened for IPv6 addresses, e.g. `2001:4860:4802:34:0:0:0:a:53`.

```
Error: Error: send EINVAL 2001:4860:4802:34:0:0:0:a:53
    at doSend (node:dgram:717:16)
    at defaultTriggerAsyncIdScope (node:internal/async_hooks:464:18)
    at afterDns (node:dgram:663:5)
    at processTicksAndRejections (node:internal/process/task_queues:83:21) {
  errno: -22,
  code: 'EINVAL',
  syscall: 'send',
  address: '2001:4860:4802:34:0:0:0:a',
  port: 53
}
```

`EINVAL` is an error code for invalid argument

So we're sending an invalid argument using `send`.

The problem was I was using Udp4 sockets for IPv6 addresses, which doesn't work. We have to use Udp6 addresses.

# What is DNS?

Domain Name System (DNS) is like the phonebook of the internet. Humans access information online through domain names, like nytimes.com or espn.com. Web browsers interact through Internet Protocol (IP) addresses. DNS translates domain names to IP addresses so browsers can load Internet resources.

## How Does DNS Work?

1. **Entering the Website Name:**

   - **Analogy:** You want to send a letter to your friend but only know their name, not their address.
   - You type a website name (like "example.com") into your browser.

2. **DNS Lookup:**

   - **Analogy:** The post office checks its directory to find your friend's address.
   - Your computer contacts a DNS server and asks for the IP address associated with "example.com".

3. **DNS Server Response:**

   - **Analogy:** The post office finds the address and gives it to you.
   - The DNS server finds the IP address for "example.com" and sends it back to your computer.

4. **Connecting to the Website:**
   - **Analogy:** Now that you have the address, you can send your letter.
   - Your computer uses the IP address to connect to the website's server and access its content.

## The Inner Workings of DNS

- **DNS Hierarchy and Structure:**
  - **Analogy:** Think of DNS as a tree with branches. At the top is the root domain, under which are top-level domains (TLDs) like .com, .net, .org. Under these are second-level domains, which are the names people can register (like "google" in "google.com").
- **Types of DNS Servers:**

  - **Root Name Servers:** Like an index in a library that directs you to different sections.
  - **TLD Name Servers:** Like a specific shelf in the library that holds books from one category.
  - **Authoritative Name Servers:** Like a specific book in the library that provides detailed information on a particular topic.

- **Caching:**

  - **Analogy:** Your browser remembers the address (IP) it found for a while.

- **DNS Resolution Process:**
  - **Recursive Resolver:** Your computer's first stop for DNS queries. Like asking a librarian to find a book for you.
  - **DNS Query Process:** The recursive resolver asks the root server, which directs it to the TLD server, which in turn points to the authoritative server for the final IP address.

# Learnings

## What is a packet?

A packet in network communication is a small segment of data sent over a digital network. When data is transmitted over the Internet, it is broken down into smaller, more manageable pieces known as packets. Each packet contains not only a portion of the data you're sending but also important information about the data.

### Components of a Packet:

1. **Header:** This part contains control information, such as:

   - Source and destination IP addresses (tells where the packet is coming from and where it's going).
   - Protocol type (like TCP or UDP).
   - Packet number (which helps in reassembling the packets in the correct order).

2. **Payload:** This is the actual data that the packet is transporting.

3. **Trailer:** This part contains error-checking and other data that ensures the integrity of the packet.

### Analogy

Imagine sending a long letter to a friend. Instead of sending the whole letter in one big envelope, you divide it into smaller parts, each with a note saying "Page 1 of 10", "Page 2 of 10", and so on. Each of these smaller parts is like a packet. When your friend receives them, they can use the information on each part to reassemble the entire letter in the correct order.

## UDP (User Datagram Protocol)

**Analogy:** Think of UDP like sending a letter through regular mail. You write your message, put it in an envelope, and send it off. But, there's no guarantee that it will reach its destination, or in what condition it will arrive. There's no acknowledgment from the receiver, and you don't wait for a reply.

**Pros:**

- **Speed:** UDP is faster because it has minimal error-checking and no acknowledgment mechanism.
- **Efficiency:** It's useful for applications where speed and efficiency are more critical than accuracy.

**Cons:**

- **No Reliability:** There’s no guarantee that the packets will reach their destination.
- **No Order Guarantee:** Packets can arrive out of order.

**Use Cases:**

- Live streaming
- Online gaming
- Voice or Video calls (where minor loss of data is acceptable for the sake of real-time communication)

### What is Datagram?

A datagram is a small packet of information sent over a network without confirmation of receipt. It's a concept used in UDP. You can think of it like a postcard sent without any guarantee of delivery. Quick but not always reliable.

## TCP (Transmission Control Protocol)

**Analogy:** TCP is like sending a certified mail. When you send a letter, you get a receipt, and the recipient signs upon delivery. If something goes wrong, the postal service takes steps to correct it.

**Pros:**

- **Reliability:** Ensures data is delivered accurately and in order.
- **Error Checking:** If a packet is lost, TCP retransmits it.

**Cons:**

- **Slower:** This reliability and error-checking come at the cost of speed.
- **More Overhead:** Requires more resources to maintain the connection state and check data integrity.

**Use Cases:**

- Web browsing
- Email
- File transfers

## Comparison between UDP and TCP

| Feature     | UDP                            | TCP                           |
| ----------- | ------------------------------ | ----------------------------- |
| Reliability | Low (No guarantee of delivery) | High (Guaranteed delivery)    |
| Speed       | High                           | Lower due to error correction |
| Ordering    | No guarantee                   | Maintains order               |
| Use Case    | Streaming, Gaming              | Web browsing, Email           |
| Overhead    | Low                            | High                          |

- **Connection:** TCP is connection-oriented. UDP is connectionless.
- **Reliability:** TCP is reliable. UDP is not.
- **Order and Integrity:** TCP maintains order and integrity of data. UDP does not.
- **Speed:** TCP is slower due to its reliability mechanisms. UDP is faster but less reliable.

## Why UDP for DNS Resolver and not TCP?

- UDP is faster than TCP. It doesn't establish a connection before sending data, and it doesn't wait for acknowledgment.
- DNS queries are usually small.
- UDP is connectionless, so it doesn't require the overhead of end-to-end connection.
- If a response is not received within a timeframe, the client can retransmit the request.

## DNS Message Format

### Query (Question)

#### Human-Readable Format:

1. **Transaction ID**: A unique identifier for the query.
2. **Flags**: Control flags (e.g., recursion desired).
3. **Questions Count**: Number of questions in the query.
4. **Answer RRs**: Number of answer resource records (0 in a query).
5. **Authority RRs**: Number of authority resource records (0 in a query).
6. **Additional RRs**: Number of additional resource records (0 in a query).
7. **Query**: The actual question, including:
   - **Domain Name**: The name being queried (e.g., "www.example.com").
   - **Type**: Type of the query (e.g., A, AAAA, NS).
   - **Class**: Class of the query (usually IN for internet).

#### Technical Format:

1. **Transaction ID**: 2 bytes
2. **Flags**: 2 bytes (including QR bit set to 0 indicating query)
3. **Questions Count**: 2 bytes
4. **Answer RRs**: 2 bytes (0x0000 for query)
5. **Authority RRs**: 2 bytes (0x0000 for query)
6. **Additional RRs**: 2 bytes (0x0000 for query)
7. **Query Section**: Variable length
   - **Domain Name**: Label format (length byte + label)
   - **Type**: 2 bytes (e.g., 0x0001 for A record)
   - **Class**: 2 bytes (0x0001 for IN)

### Response (Answer)

#### Human-Readable Format:

1. **Transaction ID**: Matches the ID in the query.
2. **Flags**: Control flags (e.g., query/response flag, authoritative answer).
3. **Questions Count**: Number of questions (usually 1).
4. **Answer RRs**: Number of answer resource records.
5. **Authority RRs**: Number of authority resource records.
6. **Additional RRs**: Number of additional resource records.
7. **Answers**: The resource records answering the query, including:
   - **Domain Name**: The name being responded to.
   - **Type**: Type of the answer (e.g., A, AAAA, NS).
   - **Class**: Class of the answer (usually IN).
   - **TTL**: Time to live.
   - **Data Length**: Length of the RDATA field.
   - **RDATA**: Resource data (e.g., IP address).

#### Technical Format:

1. **Transaction ID**: 2 bytes
2. **Flags**: 2 bytes (including QR bit set to 1 indicating response)
3. **Questions Count**: 2 bytes
4. **Answer RRs**: 2 bytes
5. **Authority RRs**: 2 bytes
6. **Additional RRs**: 2 bytes
7. **Resource Records Section**: Variable length
   - **Domain Name**: Label format or pointer
   - **Type**: 2 bytes
   - **Class**: 2 bytes
   - **TTL**: 4 bytes
   - **Data Length**: 2 bytes
   - **RDATA**: Variable length based on type

## The "Recursion Desired" Flag

In the DNS header, the "Recursion Desired" flag, when set to 1, tells the DNS server that it should perform a recursive query if it doesn't have the answer. A recursive query means the DNS server will query other servers on your behalf until it finds the answer, rather than just referring you to another server. Setting this flag is common for most client-side DNS requests, as it simplifies the client's job.

## Big Endian

"Endian" refers to the order in which bytes are arranged and interpreted in computer memory. It's about which end (big or little) of a data word is stored in the lowest memory address.

Think of big endian as writing a date in the format Year-Month-Day. No matter where you start reading (from the left), you get the most significant part first (the year).

In traditional decimal numbers, 1 in 1234 is the most significant because it holds the highest value (1000). Similarly, in binary or hexadecimal numbers, the byte or digit farthest to the left holds the highest value.

**Big Endian:** The most significant byte (the "big end") of the data is placed at the byte with the lowest address. For example, for the number 0x1234, 0x12 is stored first.

**Why Big Endian for DNS:** DNS protocol, as defined in RFC 1035, specifies the use of big endian (also known as network byte order) for transmitting numbers. This is important for interoperability, ensuring that all systems talking DNS protocol interpret multi-byte numbers in the same way, regardless of their native byte order. It's kind of like reading in english. We read left to right. But in arabic for example, you read right to left.

## Buffer

A Buffer in Node.js is a simple way to handle raw binary data. Think of it as a sequence of bytes, much like an array, but with a fixed size and specifically designed for binary data.

## What is a Buffer?

- **Fixed-size Chunk of Memory:** A Buffer is essentially a block of memory outside the V8 JavaScript engine's heap. This memory block can store a fixed amount of data in a binary format.
- **Array of Bytes:** You can think of a Buffer as an array where each element is a byte (8 bits). Unlike JavaScript arrays, which can store different types of elements, a Buffer is dedicated to bytes only.
- **Handles Binary Data:** Buffers are particularly useful when you need to work with binary data, like reading files from a disk, interacting with streams, or dealing with network communications.
- **Encoding/Decoding Data:** A Buffer can represent data in various encodings (like UTF-8, ASCII, or Base64) and is capable of converting data to and from these formats.

## Single Byte

A "single byte" means a unit of digital information composed of 8 bits.

- The length of each domain label (like 'www' or 'google') is converted into a binary format that occupies exactly 8 bits.
- For instance, if a label is 'www', its length is 3. The binary representation of 3 is `00000011`, which is a single byte.
- This byte is used in the DNS query to tell the server how many characters the following label has.

## `encodeDomainName('www.youtube.com')` -> `<Buffer 03 77 77 77 07 79 6f 75 74 75 62 65 03 63 6f 6d 00>`

- `03` - The length of the first label "www" (3 characters).
- `77 77 77` - The ASCII values for the characters 'w', 'w', 'w'.
- `07` - The length of the second label "youtube" (7 characters).
- `79 6f 75 74 75 62 65` - The ASCII values for 'y', 'o', 'u', 't', 'u', 'b', 'e'.
- `03` - The length of the third label "com" (3 characters).
- `63 6f 6d` - The ASCII values for 'c', 'o', 'm'.
- `00` - A null byte indicating the end of the domain name.

## Hexadecimal

"Hexadecimal" or "hex" is a base-16 number system. Used as a human-friendly way of representing binary data. In hex, each digit can represent 16 different values (0-9 and A-F), where 'A' stands for 10, 'B' for 11, up to 'F' which stands for 15.

In the context of binary data, two hexadecimal digits can represent one byte (8 bits). For example, the byte 10101010 in binary would be AA in hexadecimal.

## DNS Compression

DNS compression is a technique used to reduce the size of DNS messages. It's done because UDP messages have a maximum size limit of 512 bytes. Compression is achieved by replacing repeated domain names with a pointer to the first occurrence of the name.

Domain names are repeated in DNS messages because:

- Multiple Resource Records (RRs) can have the same domain name, e.g. A Record, MX Record, etc.
- Subdomains are appended to the domain name, e.g. `www.example.com` and `mail.example.com`.

In DNS messages, every part of a domain name (like `www` or `example`) is a label, and each label is stored with a length byte in front of it. This length byte tells us how many characters are in the label. For example, `www` would be stored as `3www`.

However, in the DNS compression scheme, there's a need to distinguish between these regular labels and compression pointers.

This is where the first two bits become important:

- **Regular Label:** For a regular label (like `www`), the first two bits of the length byte are `00`. This means any value from `0` to `63` (since 6 bits remain to represent the length).

- **Compression Pointer:** In a compression pointer, the first two bits of the byte are set to `11`. This is a special flag that tells the DNS parser, "This is not a regular label, but a pointer to somewhere else in the message."

So, when the DNS parser reads a byte and sees `11` at the start, it knows to interpret the next 14 bits as an offset, not as a label or its length.

## Offset

An "offset" in this context is like an index or a specific location in the DNS message.

Visual representation:

```
|H|e|a|d|e|r|.|.|.|e|x|a|m|p|l|e|.|c|o|m|.|.|.|w|w|w|.|[pointer]|
 0 1 2 3 4 5 6 7   11 12 13 14 15 16 17 18 19 20 21 22    24
```

- Each letter and symbol is a byte.
- Suppose `example.com` starts at position 12. So, the offset for `example.com` is `12`.
- When the DNS message needs to repeat `example.com`, instead of writing it out again, it uses a pointer. The pointer says, "Go to position 12 to find `example.com`."

## Why the next 14 bits?

- A byte is 8 bits. But the first two bits are used to signal that this is a pointer.
- This leaves 6 bits in the first byte. But 6 bits (which can represent a maximum of 63) aren't enough for a larger DNS message. So, DNS needs more bits to represent the offset.
- The solution is to use another byte (another 8 bits), making a total of 14 bits for the offset. This allows representing offsets up to 16383, which is much larger than a single byte could allow.

So, when the DNS parser sees `11`, it knows that it's a pointer, and the next 14 bits (6 from the current byte and 8 from the next byte) represent the offset. This design choice is a balance between having a large enough range for offsets and not using too much space for the pointer itself.

## Resource Record

A Resource Record (RR) in DNS is a basic information unit. It's a single entry in the DNS database that provides information about a domain. Each RR has a specific type and contains data relevant to that type.

A Resource Record (RR) in DNS is a basic information unit. It's essentially a single entry in the DNS database that provides information about a domain. Each RR has a specific type and contains data relevant to that type.

- **A Record:** Maps a domain name to an IPv4 address (e.g., `example.com` to `192.0.2.1`).
- **MX Record:** Specifies the mail server for a domain (for handling email).
- **CNAME Record:** Provides the canonical name for an alias (like redirecting `www` to the primary domain).
- **NS Record:** Indicates the authoritative Name Server for the domain.
- **TXT Record:** Holds text information, often used for various verification methods.

Each RR in a DNS response includes several fields:

- **Name:** The domain name the record is about.
- **Type:** The type of the RR (A, MX, CNAME, etc.).
- **Class:** The class of the network (usually IN for internet).
- **TTL (Time To Live):** How long the record can be cached before needing a refresh.
- **RDATA:** The data of the record, which varies based on the type (like an IP address for A records).

## Hex Values in the Context of the DNS Query Code

1. **`0x00` and `0x01`**: These are hex values representing the numbers 0 and 1 in decimal. In binary, `0x00` is `00000000` (8 bits all set to zero), and `0x01` is `00000001` (7 bits set to zero and the last bit set to one). In the DNS query:

   - `0x00` is used to signal the end of a string (null byte) in the domain name.
   - `0x01` is used to specify the query type (A record) and the query class (IN - Internet).

2. **`0x0100`**: This is a larger hex value that translates to `00000001 00000000` in binary (16 bits). The first `01` represents the byte with its last bit set, and `00` is a byte with all bits unset. In the DNS query, `0x0100` is used as part of the flags field in the DNS message header to indicate a standard query with recursion desired.

   - Here, `0x0100` specifically sets the RD (Recursion Desired) flag in the DNS header. The binary representation spreads across two bytes: the first byte is `00000001` (setting the RD flag), and the second byte is `00000000` (keeping other flags in the first half of the 16-bit flags field unset).

## Masking

Masking is the process of using a bitmask to isolate or modify specific bits in a byte or group of bytes.

1. **Bitmask**:

   - A bitmask is a binary number where specific bits are set to `1` or `0`.
   - The bits set to `1` in the mask are the ones you're interested in, while the bits set to `0` are those you want to ignore or clear.

2. **Applying the Mask**:

   - When you apply a bitmask to another binary number, you use bitwise operators (like AND, OR, XOR).
   - The most common operation for masking is the bitwise AND (`&`), which isolates bits.
   - Read more about bitwise operators on my blog: [Bitwise Operators in C](https://tigerabrodi.hashnode.dev/bitwise-operators-in-c-with-exercise).

3. **Isolating Bits with AND (`&`)**:
   - When a bitmask is ANDed with a number, each bit of the number is compared with the corresponding bit in the mask:
     - If the mask bit is `1`, the original bit is kept.
     - If the mask bit is `0`, the original bit is cleared (set to `0`).

##
