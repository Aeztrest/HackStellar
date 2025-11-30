# CreatorHub - Web3 Encrypted Content Platform

A secure, decentralized content platform built with Next.js, TypeScript, and Web3 technology, leveraging Stellar's Soroban smart contracts, IPFS for storage, and Web Crypto API for client-side encryption.

## Overview

CreatorHub is a Patreon-like platform where:
- **Creators** upload encrypted content to IPFS, mint it on the blockchain, and monetize their work
- **Subscribers** can subscribe to creators and purchase individual content pieces
- Content is **encrypted end-to-end** with AES-GCM encryption
- **Decryption happens client-side** for maximum security
- All transactions use **Stellar's Soroban contracts**

## Features

### Creator Features
- Register as a creator with custom subscription pricing
- Upload content with client-side AES-GCM encryption
- Automatic IPFS upload of encrypted content
- Blockchain minting of content with immutable records
- Track all created content

### Subscriber Features
- Subscribe to creators for recurring access
- Purchase individual content pieces
- Decrypt and view encrypted content securely
- Support for video, images, and PDFs

### Security
- **End-to-end encryption** using Web Crypto API (AES-GCM)
- **Client-side decryption** - backend never has access to content
- **Row-level access control** via smart contracts
- **Non-custodial wallet integration** using Freighter

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Encryption**: Web Crypto API (AES-GCM-256)
- **Storage**: IPFS (via gateway)
- **Blockchain**: Stellar Soroban
- **Wallet**: Freighter (Stellar)
- **API**: REST endpoints

## Environment Variables

Set these in your Vercel/environment:

\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
\`\`\`

**Development example**: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
**Production**: Point to your deployed backend API

## Installation & Setup

### 1. Prerequisites
- Node.js 18+
- Freighter wallet extension (install from browser extension store)
- Stellar testnet account with XLM funds

### 2. Clone & Install

\`\`\`bash
git clone <repository>
cd creator-hub
npm install
\`\`\`

### 3. Environment Setup

Create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Usage Flow

### Creator Workflow
1. **Connect Wallet**: Click "Connect Wallet" → Approve in Freighter
2. **Register**: Enter subscription price → "Register as Creator"
3. **Upload Content**:
   - Fill title, description, price
   - Select file (video, image, PDF, etc.)
   - Check "Subscribers only" if needed
   - Click "Encrypt, Upload & Mint"
4. **Track**: View created content in the dashboard

### Subscriber Workflow
1. **Connect Wallet**: Click "Connect Wallet" → Approve in Freighter
2. **Subscribe**: 
   - Enter creator address
   - Select duration (1-12 months)
   - Click "Subscribe"
3. **Buy Content**:
   - Enter content ID
   - Click "Buy Content"
4. **View Content**:
   - Enter content ID and encrypted CID
   - Click "Decrypt & View Content"
   - Content appears securely in preview

## API Endpoints

All endpoints require `NEXT_PUBLIC_API_BASE_URL` to be configured:

### IPFS
- `POST /ipfs/upload` - Upload encrypted file
- Response: `{ cid, ipfs_uri, gateway_url }`

### Creator
- `POST /creator/register` - Register as creator
- Body: `{ creator_address, profile_uri, subscription_price }`

### Content
- `POST /content/mint` - Mint encrypted content
- Body: `{ creator_address, ipfs_cid, price, is_for_subscribers, aes_key }`
- `POST /content/key` - Get AES decryption key
- Body: `{ wallet_address, content_id }`

### Transactions
- `POST /subscription/subscribe` - Subscribe to creator
- Body: `{ subscriber_address, creator_address, months }`
- `POST /content/buy` - Buy individual content
- Body: `{ subscriber_address, content_id }`

### Access Control
- `POST /access/check` - Check if user has access
- Body: `{ user_address, content_id }`
- Response: `{ ok, has_access }`

## Security & Encryption Flow

### Encryption (Upload)
1. Generate random AES-256 key
2. Generate random 96-bit IV
3. Encrypt file with AES-GCM
4. Export key + combine with IV
5. Convert to base64
6. Upload encrypted blob to IPFS
7. Store base64 key in backend (AES key management endpoint)

### Decryption (View)
1. Get content ID from user
2. Call `/content/key` with wallet + content ID
3. Backend validates access via smart contract
4. Backend returns AES key + IV (base64)
5. Fetch encrypted file from IPFS gateway
6. Client-side: Decrypt with AES-GCM
7. Display in browser (video/image/PDF player)

## File Structure

\`\`\`
src/
├── app/
│   ├── page.tsx              # Main dashboard with tabs
│   ├── layout.tsx            # Root layout with providers
│   └── globals.css           # Tailwind & design tokens
├── components/
│   ├── wallet-connect-button.tsx    # Freighter connection
│   ├── creator-dashboard.tsx        # Creator panel
│   ├── subscriber-dashboard.tsx     # Subscriber panel
│   ├── encrypted-upload-form.tsx    # Content upload
│   ├── content-viewer.tsx           # Encrypted viewer
│   ├── navbar.tsx                   # Navigation
│   └── ui/
│       ├── button.tsx               # Button component
│       ├── card.tsx                 # Card container
│       └── toast.tsx                # Notifications
├── contexts/
│   └── wallet-context.tsx    # Freighter state management
├── lib/
│   └── types.ts             # TypeScript interfaces
└── utils/
    ├── crypto.ts            # AES-GCM encrypt/decrypt
    └── api.ts               # Backend API calls
\`\`\`

## Key Implementation Details

### Crypto Utilities (`utils/crypto.ts`)
- `encryptFile()`: Generates key, encrypts file, returns base64 key+IV
- `decryptFile()`: Validates base64 key, decrypts IPFS content
- `createObjectURLFromBuffer()`: Converts decrypted buffer to displayable URL

### Wallet Context (`contexts/wallet-context.tsx`)
- Global state for Freighter connection
- `connect()`: Opens Freighter popup, gets public key
- `disconnect()`: Clears wallet state
- Used across all components via `useWallet()` hook

### Component Architecture
- **WalletConnectButton**: Simple connection UX with truncated address
- **CreatorDashboard**: Profile management + upload form + content list
- **SubscriberDashboard**: Subscription + purchase + content viewer
- **ContentViewer**: Handles decryption flow with progress tracking

## Troubleshooting

### "Freighter wallet not found"
- Install Freighter extension from browser extension store
- Refresh the page

### "Failed to decrypt content"
- Verify content ID and encrypted CID are correct
- Check that your wallet has access to the content
- Ensure API base URL is correct

### IPFS upload failures
- Check `NEXT_PUBLIC_API_BASE_URL` is pointing to running backend
- Verify backend IPFS service is operational

### Smart contract failures
- Ensure wallet has XLM for transaction fees
- Verify creator is registered before minting content
- Check subscription duration is valid (1-12 months)

## Development

### Adding a new component
1. Create file in `components/`
2. Use `useWallet()` hook for wallet data
3. Use `Toast` component for notifications
4. Follow existing card/button styling patterns

### Modifying encryption
- All crypto logic in `utils/crypto.ts`
- AES-256-GCM is hardcoded (symmetric encryption)
- IV is randomly generated per file
- Key export format: `[32 bytes key][12 bytes IV]` → base64

## Deployment

### Vercel Deployment
\`\`\`bash
npm run build
# Push to GitHub
# Connect to Vercel
\`\`\`

Set environment variables in Vercel dashboard:
\`\`\`
NEXT_PUBLIC_API_BASE_URL=<your-backend-url>
\`\`\`

## Future Enhancements

- [ ] NFT integration for content ownership
- [ ] Batch content uploads
- [ ] Creator analytics dashboard
- [ ] Subscription tier system
- [ ] Content recommendations
- [ ] Creator verification system
- [ ] Revenue sharing analytics
- [ ] Multi-creator bundles

## License

MIT

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API endpoint documentation
3. Ensure Freighter wallet is installed and working
4. Verify backend API is running and accessible
