// Type definitions for the Web3 Creator Hub platform
export interface WalletContextType {
  publicKey: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  error: string | null
}

export interface CreatedContent {
  id: number
  encryptedCid: string
  price: number
  isForSubscribers: boolean
  title?: string
  description?: string
}

export interface ContentKeyResponse {
  ok: boolean
  content_id: number
  aes_key: string
}

export interface AccessCheckResponse {
  ok: boolean
  has_access: boolean
}

export interface ContentMintResponse {
  ok: boolean
  content_id: number
  cli_output: string
}

export interface IPFSUploadResponse {
  cid: string
  ipfs_uri: string
  gateway_url: string
}

export interface CreatorRegisterResponse {
  ok?: boolean
  message?: string
}

export interface SubscribeResponse {
  ok?: boolean
  message?: string
}

export interface BuyContentResponse {
  ok?: boolean
  message?: string
}
