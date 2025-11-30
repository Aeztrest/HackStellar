"use client"

import { WalletConnectButton } from "./wallet-connect-button"

export function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-white">CreatorHub</span>
          </div>
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  )
}
