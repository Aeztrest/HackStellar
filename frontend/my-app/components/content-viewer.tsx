"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"

interface ContentViewerProps {
  onError: (error: string) => void
}

export function ContentViewer({ onError }: ContentViewerProps) {
  const { publicKey } = useWallet()
  const [contentId, setContentId] = useState("")
  const [encryptedCid, setEncryptedCid] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [viewProgress, setViewProgress] = useState("")
  const [contentUrl, setContentUrl] = useState<string | null>(null)
  const [contentType, setContentType] = useState<"video" | "image" | "pdf" | null>(null)

  const handleView = async () => {
    if (!publicKey) {
      onError("Please connect your wallet first")
      return
    }

    if (!contentId || !encryptedCid) {
      onError("Please enter both content ID and encrypted CID")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Call /content/key API to get AES key
      // TODO: Fetch encrypted file from IPFS
      // TODO: Decrypt using client-side Web Crypto API
      console.log("[v0] Fetching content with:", {
        wallet_address: publicKey,
        content_id: Number.parseInt(contentId),
        encrypted_cid: encryptedCid,
      })

      setViewProgress("Retrieving decryption key...")
      await new Promise((resolve) => setTimeout(resolve, 800))

      setViewProgress("Downloading content from IPFS...")
      await new Promise((resolve) => setTimeout(resolve, 800))

      setViewProgress("Decrypting content...")
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock content display
      setContentUrl("/decrypted-content-preview.jpg")
      setContentType("image")
      setViewProgress("")
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to view content")
      setViewProgress("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="content-id" className="block text-sm font-semibold text-foreground mb-2">
            Content ID
          </label>
          <input
            id="content-id"
            type="number"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            placeholder="Enter content ID"
            disabled={isLoading || !publicKey}
            className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="encrypted-cid" className="block text-sm font-semibold text-foreground mb-2">
            Encrypted CID
          </label>
          <input
            id="encrypted-cid"
            type="text"
            value={encryptedCid}
            onChange={(e) => setEncryptedCid(e.target.value)}
            placeholder="Qm..."
            disabled={isLoading || !publicKey}
            className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
        </div>

        {viewProgress && (
          <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm font-medium">
            {viewProgress}
          </div>
        )}

        <Button
          onClick={handleView}
          disabled={isLoading || !publicKey || !contentId || !encryptedCid}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Decrypt & View Content"}
        </Button>
      </div>

      {contentUrl && (
        <div className="mt-6 p-4 rounded-lg border border-zinc-700 bg-zinc-800/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Content Preview</h3>
          {contentType === "video" && (
            <video src={contentUrl} controls className="w-full max-h-96 rounded-lg bg-black" />
          )}
          {contentType === "image" && (
            <img
              src={contentUrl || "/placeholder.svg"}
              alt="Decrypted content"
              className="w-full max-h-96 rounded-lg"
            />
          )}
          {contentType === "pdf" && (
            <iframe src={contentUrl} className="w-full h-96 rounded-lg" title="Decrypted PDF" />
          )}
        </div>
      )}
    </div>
  )
}
