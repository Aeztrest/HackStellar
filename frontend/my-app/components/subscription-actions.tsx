"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface SubscriptionActionsProps {
  isConnected: boolean
  isLoading?: boolean
  onSubscribe: (creatorAddress: string, months: number) => void
}

export function SubscriptionActions({ isConnected, isLoading = false, onSubscribe }: SubscriptionActionsProps) {
  const [creatorAddress, setCreatorAddress] = useState("")
  const [months, setMonths] = useState("1")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubscribe(creatorAddress, Number.parseInt(months))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="creator-addr" className="block text-sm font-semibold text-foreground mb-2">
          Creator Address
        </label>
        <input
          id="creator-addr"
          type="text"
          value={creatorAddress}
          onChange={(e) => setCreatorAddress(e.target.value)}
          placeholder="G..."
          disabled={isLoading || !isConnected}
          className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="months" className="block text-sm font-semibold text-foreground mb-2">
          Duration (Months)
        </label>
        <select
          id="months"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          disabled={isLoading || !isConnected}
          className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m} month{m > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !isConnected || !creatorAddress}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Processing..." : "Subscribe"}
      </Button>
    </form>
  )
}
