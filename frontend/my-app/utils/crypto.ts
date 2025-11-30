const ALGORITHM = "AES-GCM"
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for GCM

/**
 * Generate a random AES key and encrypt a file
 * Returns the encrypted blob and the base64-encoded key+IV combination
 */
export async function encryptFile(file: File): Promise<{
  encryptedBlob: Blob
  base64Key: string
}> {
  // Generate a new AES-GCM key
  const key = await crypto.subtle.generateKey({ name: ALGORITHM, length: KEY_LENGTH }, true, ["encrypt", "decrypt"])

  // Generate a random IV (initialization vector)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  // Read the file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer()

  // Encrypt the file
  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, fileBuffer)

  // Export the key as raw bytes
  const rawKey = await crypto.subtle.exportKey("raw", key)

  // Combine key and IV into a single Uint8Array
  const keyBytes = new Uint8Array(rawKey)
  const combined = new Uint8Array(keyBytes.length + iv.length)
  combined.set(keyBytes, 0)
  combined.set(iv, keyBytes.length)

  // Convert to base64
  const base64Key = btoa(String.fromCharCode.apply(null, Array.from(combined)))

  // Create blob from encrypted data
  const encryptedBlob = new Blob([encrypted], { type: "application/octet-stream" })

  return { encryptedBlob, base64Key }
}

/**
 * Decrypt a file using the base64-encoded key+IV combination
 * Returns the decrypted ArrayBuffer
 */
export async function decryptFile(encryptedArrayBuffer: ArrayBuffer, base64Key: string): Promise<ArrayBuffer> {
  try {
    // Decode base64 key
    const binaryString = atob(base64Key)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Split into key and IV
    const keyBytes = bytes.slice(0, KEY_LENGTH / 8) // 32 bytes for AES-256
    const iv = bytes.slice(KEY_LENGTH / 8)

    // Import the key
    const key = await crypto.subtle.importKey("raw", keyBytes, { name: ALGORITHM }, false, ["decrypt"])

    // Decrypt
    const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encryptedArrayBuffer)

    return decrypted
  } catch (error) {
    console.error("Decryption failed:", error)
    throw new Error("Failed to decrypt content. Invalid key or corrupted file.")
  }
}

/**
 * Helper to convert ArrayBuffer to Blob with specified type
 */
export function arrayBufferToBlob(buffer: ArrayBuffer, mimeType: string): Blob {
  return new Blob([buffer], { type: mimeType })
}

/**
 * Helper to create object URL from ArrayBuffer
 */
export function createObjectURLFromBuffer(buffer: ArrayBuffer, mimeType: string): string {
  const blob = arrayBufferToBlob(buffer, mimeType)
  return URL.createObjectURL(blob)
}
