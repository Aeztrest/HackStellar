"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionActions } from "./subscription-actions"
import { ContentViewer } from "./content-viewer"
import { Toast } from "./ui/toast-custom"

export function SubscriberDashboard() {
  const { publicKey } = useWallet()
  const [contentId, setContentId] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const handleSubscribe = async (creatorAddress: string, months: number) => {
    if (!publicKey) {
      setToast({ message: "Please connect your wallet first", type: "error" })
      return
    }

    setIsSubscribing(true)
    try {
      // TODO: Call /subscription/subscribe API endpoint
      console.log("[v0] Subscribing with:", {
        subscriber_address: publicKey,
        creator_address: creatorAddress,
        months,
      })

      setToast({ message: "Subscription successful!", type: "success" })
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Subscription failed",
        type: "error",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleBuyContent = async () => {
    if (!publicKey) {
      setToast({ message: "Please connect your wallet first", type: "error" })
      return
    }

    if (!contentId) {
      setToast({ message: "Please enter content ID", type: "error" })
      return
    }

    setIsBuying(true)
    try {
      // TODO: Call /content/buy API endpoint
      console.log("[v0] Buying content with:", {
        subscriber_address: publicKey,
        content_id: Number.parseInt(contentId),
      })

      setToast({ message: "Purchase successful!", type: "success" })
      setContentId("")
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Purchase failed",
        type: "error",
      })
    } finally {
      setIsBuying(false)
    }
  }

  const handleError = (error: string) => {
    setToast({ message: error, type: "error" })
  }

  return (
    <div className="space-y-6">
      {/* Subscribe to Creator Section */}
      <Card className="border border-zinc-800 bg-zinc-900 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">Subscribe to Creator</CardTitle>
          <CardDescription>Subscribe to get exclusive content access</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionActions isConnected={!!publicKey} isLoading={isSubscribing} onSubscribe={handleSubscribe} />
        </CardContent>
      </Card>

      {/* Buy Single Content Section */}
      <Card className="border border-zinc-800 bg-zinc-900 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">Buy Single Content</CardTitle>
          <CardDescription>Purchase individual content pieces</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              disabled={isBuying || !publicKey}
              className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
            />
          </div>

          <Button
            onClick={handleBuyContent}
            disabled={isBuying || !publicKey || !contentId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          >
            {isBuying ? "Processing..." : "Buy Content"}
          </Button>
        </CardContent>
      </Card>

      {/* View Content Section */}
      <Card className="border border-zinc-800 bg-zinc-900 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">View Content</CardTitle>
          <CardDescription>Decrypt and view your purchased content</CardDescription>
        </CardHeader>
        <CardContent>
          <ContentViewer onError={handleError} />
        </CardContent>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
