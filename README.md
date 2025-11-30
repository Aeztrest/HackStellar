# 🔐 CreatorChain – On-Chain Memberships & Encrypted Content Platform  
*Decentralized, censorship-resistant, and interoperable alternative to Patreon & YouTube Memberships.*

CreatorChain is a Web3-powered membership platform where creators can monetize their content using **on-chain subscriptions**, **encrypted IPFS storage**, and **wallet-based access control**.  
It provides a secure, transparent, and platform-independent way for creators to own their audience and deliver gated content without relying on centralized services.

---

## 🚀 Why This Project?  
Traditional Web2 membership platforms—such as Patreon or YouTube Memberships—have fundamental limitations:

### ❌ **Creators don't truly own their community**
Subscriber data, access rights, and monetization rules belong to the platform.  
If the platform bans, restricts, or freezes the account, the creator loses everything.

### ❌ **High fees & unclear monetization models**  
Most platforms take 8–30% in fees, plus payment processor deductions.  
Creators often don’t know how much they actually earn until payouts are processed.

### ❌ **Closed ecosystems (lack of composability)**  
A Patreon membership cannot be used for:
- Discord token-gated roles  
- in-game perks  
- event access  
- cross-platform utilities  

Memberships are locked inside the platform’s own database.

### ❌ **Limited global accessibility**  
Creators in many countries face:  
- payment restrictions  
- banking issues  
- delayed payouts  
- lack of access to Stripe/PayPal  

---

## ✔️ **Our Solution: On-Chain Memberships + Encrypted Content**

CreatorChain introduces a fully Web3 membership model:

### 🔗 **1. On-chain membership tokens (NFT / SBT / access-pass)**
Subscriptions are represented as on-chain assets.  
This gives creators **true ownership** over their audience.

- No centralized database  
- No lock-in  
- Data persists even if the platform disappears  
- Interoperable with any dApp or game

---

### 🔐 **2. Encrypted content storage on IPFS**
All content is stored **encrypted**, not in plain text.

**How it works:**
1. A creator uploads content.
2. The file is encrypted client-side (AES-256).
3. Only the encrypted version is uploaded to IPFS.
4. The CID is stored on-chain.
5. Only wallets with valid on-chain membership can request the decryption key.

This means:
- Even if someone knows the CID → they **cannot** access the content.  
- The backend or platform never sees the unencrypted file.  
- IPFS remains decentralized but secure.

---

### 🧩 **3. Access control powered by wallets**
Users unlock content by proving wallet ownership:

- Users sign a message with their wallet  
- Backend verifies membership via smart contract  
- If valid → user receives a decryption key  
- Content is decrypted *locally on the client*

This architecture ensures:

| Layer | Responsible For |
|-------|----------------|
| **Blockchain** | Truth: who owns membership |
| **IPFS** | Storage (encrypted only) |
| **Encryption System** | Protects content |
| **App Backend** | Key distribution |
| **Frontend** | Local decryption & rendering |

---

### 🌐 **4. Platform independence**
Since the user’s membership exists **on-chain**, not on a private database:

- Creators can migrate to another platform instantly  
- Fans keep their membership badges forever  
- Third-party builders can integrate membership perks (games, sites, events)
- No company can ban, shadowban, or block monetization

This is impossible on Patreon, YouTube, or Substack.

---

## 💡 Key Features
- 🛠 **On-chain membership management (Stellar / Soroban based)**
- 🔐 **Encrypted content storage over IPFS**
- 👛 **Wallet authentication for gated content**
- 🌍 **Global, borderless payments (XLM / USDC)**
- 📦 **Portable membership tokens across all dApps**
- 🔄 **Instant payouts with no intermediaries**
- 💸 **Transparent and low-cost monetization**
- 🧱 **Composable: membership usable across games, apps, and social platforms**

---

## 🆚 **How CreatorChain Differs from Patreon / YouTube Memberships**

| Feature | Patreon / YT | CreatorChain |
|--------|--------------|--------------|
| **Content Storage** | Centralized servers | Encrypted IPFS |
| **Access Control** | Platform database | On-chain ownership |
| **Creator Ownership** | Platform owns subscriber data | Creator owns member list |
| **Composability** | No | Yes (usable anywhere in Web3) |
| **Fees** | 8–30% | Transparent, minimal |
| **Censorship Resistance** | Low | High |
| **Global Access** | Restricted by banking | Fully borderless |
| **Payments** | Stripe/PayPal (limited countries) | XLM / USDC (instant, global) |
| **Migration** | Impossible | One-click (on-chain) |

---

## 🔧 Technical Architecture (High-Level)

### **1. Upload Flow (Creator)**
Creator uploads file
→ Browser encrypts file (AES)
→ Encrypted file is pushed to IPFS
→ CID is saved on-chain
→ Key stored by Key Server

### **2. Viewing Flow (User)**
User opens gated content
→ Wallet signature (authentication)
→ Backend checks membership via blockchain
→ If valid → returns decryption key
→ Frontend fetches encrypted CID from IPFS
→ Browser decrypts file locally
→ Content displayed

# 🛠 Tech Stack
- **Stellar / Soroban** for smart contracts  
- **Next.js + React** for frontend  
- **IPFS** for encrypted content storage  
- **AES-256 client-side encryption**  
- **Node.js backend** for key distribution  
- **Freighter Wallet** for authentication  

---

## 📜 License  
MIT License – free for builders, researchers, and open-source Web3 communities.

---

Owner:
Ezgin Akyürek
ezgincapkan64@gmail.com

CREATOR HUB CONTRACT ID = CDBTXCBAHZXUYZUC6IIFSTTDJE67R4UO5B67QEYQDXHKF7TW6VCBMH7B

