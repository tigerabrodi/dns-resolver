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
