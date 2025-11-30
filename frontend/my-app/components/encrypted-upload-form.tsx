"use client"

import type React from "react"
import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"

interface EncryptedUploadFormProps {
  onContentCreated: (content: any) => void
  onError: (error: string) => void
}

export function EncryptedUploadForm({ onContentCreated, onError }: EncryptedUploadFormProps) {
  const { publicKey } = useWallet()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [isForSubscribers, setIsForSubscribers] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadProgress("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey) {
      onError("Please connect your wallet first")
      return
    }

    if (!file) {
      onError("Please select a file")
      return
    }

    if (!price || Number.parseFloat(price) <= 0) {
      onError("Please enter a valid price")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Encryption + /ipfs/upload + /content/mint API flow
      console.log("[v0] Upload form submitted with:", {
        title,
        description,
        price: Math.floor(Number.parseFloat(price) * 1_000_000),
        isForSubscribers,
        fileName: file.name,
        fileSize: file.size,
      })

      setUploadProgress("Encrypting and uploading...")

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock success response
      const newContent = {
        id: Math.floor(Math.random() * 1000),
        title,
        description,
        encryptedCid: `QmMockCID${Math.random().toString(36).slice(2, 8)}`,
        price: Math.floor(Number.parseFloat(price) * 1_000_000),
        isForSubscribers,
      }

      onContentCreated(newContent)

      // Reset form
      setTitle("")
      setDescription("")
      setPrice("")
      setIsForSubscribers(false)
      setFile(null)
      setUploadProgress("")
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to upload content")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-foreground mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your content a catchy title"
          disabled={isLoading || !publicKey}
          className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what your content is about"
          disabled={isLoading || !publicKey}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-foreground mb-2">
            Price (XLM)
          </label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={isLoading || !publicKey}
            className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isForSubscribers}
              onChange={(e) => setIsForSubscribers(e.target.checked)}
              disabled={isLoading || !publicKey}
              className="w-4 h-4 rounded border border-zinc-600 bg-zinc-900 cursor-pointer"
            />
            <span className="text-sm font-semibold text-foreground">Subscribers only</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="file-input" className="block text-sm font-semibold text-foreground mb-2">
          Select File
        </label>
        <input
          id="file-input"
          type="file"
          onChange={handleFileSelect}
          disabled={isLoading || !publicKey}
          className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer disabled:opacity-50"
        />
        {file && <p className="text-xs text-zinc-400 mt-2">Selected: {file.name}</p>}
      </div>

      {uploadProgress && (
        <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm font-medium">
          {uploadProgress}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !publicKey || !file || !price}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Processing..." : "Encrypt, Upload & Mint"}
      </Button>
    </form>
  )
}
