"use client"

import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"

export function WalletConnectButton() {
  const { publicKey, isConnected, isConnecting, connect, disconnect, error } = useWallet()

  const handleConnect = async () => {
    try {
      console.log("[v0] Connection attempt started - Freighter popup should open")
      await connect()
      console.log("[v0] Successfully connected!")
    } catch (err) {
      console.error("[v0] Connection error:", err)
    }
  }

  const truncateAddress = (address: string) => {
    if (address.length <= 8) return address
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-medium text-green-400">
          {truncateAddress(publicKey)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && <p className="text-xs text-red-400 max-w-xs text-right">{error}</p>}
    </div>
  )
}
