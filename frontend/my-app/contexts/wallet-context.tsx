// Wallet context for managing Freighter connection and user state
"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { WalletContextType } from "@/lib/types"

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    try {
      const { requestAccess } = await import("@stellar/freighter-api")

      console.log("[v0] Requesting Freighter access - popup should appear")

      // requestAccess() will open the Freighter popup for user authorization
      const accessObj = await requestAccess()

      if (accessObj.error) {
        throw new Error(accessObj.error)
      }

      const pk = accessObj.address
      console.log("[v0] Successfully connected to wallet:", pk)
      setPublicKey(pk)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet"
      console.error("[v0] Failed to connect wallet:", errorMessage)
      setError(errorMessage)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setPublicKey(null)
    setError(null)
    console.log("[v0] Wallet disconnected")
  }, [])

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected: !!publicKey,
        connect,
        disconnect,
        isConnecting,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return context
}
