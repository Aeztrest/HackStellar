"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface CreatorProfileFormProps {
  walletAddress: string | null
  isConnected: boolean
  isLoading?: boolean
  onRegister: (profileUri: string, subscriptionPrice: string) => void
}

export function CreatorProfileForm({
  walletAddress,
  isConnected,
  isLoading = false,
  onRegister,
}: CreatorProfileFormProps) {
  const [profileUri, setProfileUri] = useState("")
  const [subscriptionPrice, setSubscriptionPrice] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRegister(profileUri, subscriptionPrice)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Wallet Address</label>
        <div className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-950 text-zinc-400 text-sm font-mono break-all">
          {walletAddress || "Not connected"}
        </div>
      </div>

      <div>
        <label htmlFor="profile-uri" className="block text-sm font-semibold text-foreground mb-2">
          Profile URI
        </label>
        <input
          id="profile-uri"
          type="text"
          value={profileUri}
          onChange={(e) => setProfileUri(e.target.value)}
          placeholder="https://example.com/profile"
          disabled={isLoading || !isConnected}
          className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-semibold text-foreground mb-2">
          Subscription Price (XLM)
        </label>
        <input
          id="price"
          type="number"
          value={subscriptionPrice}
          onChange={(e) => setSubscriptionPrice(e.target.value)}
          placeholder="10.00"
          step="0.01"
          min="0"
          disabled={isLoading || !isConnected}
          className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !isConnected || !subscriptionPrice}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Registering..." : "Register as Creator"}
      </Button>
    </form>
  )
}
