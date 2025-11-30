"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreatorProfileForm } from "./creator-profile-form"
import { EncryptedUploadForm } from "./encrypted-upload-form"
import { Toast } from "./ui/toast-custom"
import type { CreatedContent } from "@/lib/types"

export function CreatorDashboard() {
  const { publicKey } = useWallet()
  const [createdContents, setCreatedContents] = useState<CreatedContent[]>([])
  const [isRegistering, setIsRegistering] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const handleRegisterCreator = async (profileUri: string, subscriptionPrice: string) => {
    if (!publicKey) {
      setToast({ message: "Please connect your wallet first", type: "error" })
      return
    }

    if (!subscriptionPrice || Number.parseFloat(subscriptionPrice) <= 0) {
      setToast({ message: "Please enter a valid subscription price", type: "error" })
      return
    }

    setIsRegistering(true)
    try {
      // TODO: Call /creator/register API endpoint
      console.log("[v0] Registering creator with:", {
        creator_address: publicKey,
        profile_uri: profileUri || "https://example.com/profile",
        subscription_price: Math.floor(Number.parseFloat(subscriptionPrice) * 1_000_000),
      })

      setToast({ message: "Creator registered successfully!", type: "success" })
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Registration failed",
        type: "error",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleContentCreated = (content: CreatedContent) => {
    setCreatedContents((prev) => [...prev, content])
    setToast({ message: `Content #${content.id} created successfully!`, type: "success" })
  }

  const handleError = (error: string) => {
    setToast({ message: error, type: "error" })
  }

  return (
    <div className="space-y-6">
      {/* Creator Profile Section */}
      <Card className="border border-zinc-800 bg-zinc-900 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">Creator Profile</CardTitle>
          <CardDescription>Register and manage your creator account</CardDescription>
        </CardHeader>
        <CardContent>
          <CreatorProfileForm
            walletAddress={publicKey}
            isConnected={!!publicKey}
            isLoading={isRegistering}
            onRegister={handleRegisterCreator}
          />
        </CardContent>
      </Card>

      {/* Upload Content Section */}
      <Card className="border border-zinc-800 bg-zinc-900 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">Upload Content</CardTitle>
          <CardDescription>Create and encrypt content for your subscribers</CardDescription>
        </CardHeader>
        <CardContent>
          <EncryptedUploadForm onContentCreated={handleContentCreated} onError={handleError} />
        </CardContent>
      </Card>

      {/* Created Contents List */}
      {createdContents.length > 0 && (
        <Card className="border border-zinc-800 bg-zinc-900 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl">Your Content</CardTitle>
            <CardDescription>{createdContents.length} content item(s) created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {createdContents.map((content) => (
                <div
                  key={content.id}
                  className="p-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {content.title || `Content #${content.id}`}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-1">
                        CID: {content.encryptedCid.slice(0, 20)}...
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-medium text-blue-400">
                        {(content.price / 1_000_000).toFixed(2)} XLM
                      </span>
                      {content.isForSubscribers && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-400 font-medium">
                          Subscribers Only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
