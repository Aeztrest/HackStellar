const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "APIError"
  }
}

async function makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new APIError(response.status, error || `API Error: ${response.status}`)
  }

  return response.json()
}

// IPFS Upload
export async function uploadToIPFS(file: Blob): Promise<{
  cid: string
  ipfs_uri: string
  gateway_url: string
}> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/ipfs/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new APIError(response.status, "Failed to upload to IPFS")
  }

  return response.json()
}

// Creator Register
export async function registerCreator(data: {
  creator_address: string
  profile_uri: string
  subscription_price: number
}): Promise<{ ok: boolean; message?: string }> {
  return makeRequest("/creator/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Content Mint
export async function mintContent(data: {
  creator_address: string
  ipfs_cid: string
  price: number
  is_for_subscribers: boolean
  aes_key: string
}): Promise<{ ok: boolean; content_id: number; cli_output: string }> {
  return makeRequest("/content/mint", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Subscribe
export async function subscribe(data: {
  subscriber_address: string
  creator_address: string
  months: number
}): Promise<{ ok: boolean; message?: string }> {
  return makeRequest("/subscription/subscribe", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Buy Content
export async function buyContent(data: {
  subscriber_address: string
  content_id: number
}): Promise<{ ok: boolean; message?: string }> {
  return makeRequest("/content/buy", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Get Content Key
export async function getContentKey(data: {
  wallet_address: string
  content_id: number
}): Promise<{ ok: boolean; content_id: number; aes_key: string }> {
  return makeRequest("/content/key", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Check Access
export async function checkAccess(data: {
  user_address: string
  content_id: number
}): Promise<{ ok: boolean; has_access: boolean }> {
  return makeRequest("/access/check", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
