"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { WalletContextType } from "@/lib/types"

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = useCallback(async () => {
    setIsConnecting(true)
    try {
      const { isConnected, getAddress } = await import("@stellar/freighter-api")

      // Check if Freighter is available
      const connectionStatus = await isConnected()
      console.log("[v0] Freighter connection status:", connectionStatus)

      if (!connectionStatus.isConnected) {
        throw new Error(
          "Freighter wallet not connected. Please install the Freighter extension and authorize this site.",
        )
      }

      const addressResult = await getAddress()
      if (addressResult.error) {
        throw new Error(addressResult.error)
      }

      const pk = addressResult.address
      console.log("[v0] Connected to wallet:", pk)
      setPublicKey(pk)
    } catch (error) {
      console.error("[v0] Failed to connect wallet:", error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setPublicKey(null)
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
