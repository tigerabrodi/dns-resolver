# DNS Resolver from scratch

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

A packet in network communication is a small segment of data sent over a digital network. When data is transmitted over the Internet, it is broken down into smaller, more manageable pieces known as packets. Each packet contains not only a portion of the data you're sending (like a piece of an email or a video stream) but also important information about the data.

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

A datagram is a small packet of information sent over a network without confirmation of receipt. It's a concept used in UDP. You can think of it like a postcard sent without any guarantee of delivery - quick but not always reliable.

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
