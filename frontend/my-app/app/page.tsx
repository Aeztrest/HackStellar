"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { CreatorDashboard } from "@/components/creator-dashboard"
import { SubscriberDashboard } from "@/components/subscriber-dashboard"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"creator" | "subscriber">("creator")

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tab Navigation */}
          <div className="flex gap-3 mb-12 border-b border-zinc-800">
            <Button
              onClick={() => setActiveTab("creator")}
              className={`px-6 py-3 font-semibold transition-all border-b-2 rounded-none ${
                activeTab === "creator"
                  ? "border-blue-600 text-blue-500 bg-transparent hover:bg-transparent"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-transparent"
              }`}
              variant="ghost"
            >
              Creator Panel
            </Button>
            <Button
              onClick={() => setActiveTab("subscriber")}
              className={`px-6 py-3 font-semibold transition-all border-b-2 rounded-none ${
                activeTab === "subscriber"
                  ? "border-blue-600 text-blue-500 bg-transparent hover:bg-transparent"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-transparent"
              }`}
              variant="ghost"
            >
              Subscriber Panel
            </Button>
          </div>

          {/* Content Based on Active Tab */}
          {activeTab === "creator" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Info Card */}
              <Card className="border border-zinc-800 bg-zinc-900/50 shadow-lg rounded-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Creator Hub</CardTitle>
                  <CardDescription className="text-base">
                    Upload encrypted content, manage subscriptions, and earn from your audience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Register as a creator with custom subscription pricing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Upload encrypted content directly to IPFS</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Set individual prices for content or subscriber-only access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Track your created content and earnings</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Creator Dashboard */}
              <CreatorDashboard />
            </div>
          )}

          {activeTab === "subscriber" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Info Card */}
              <Card className="border border-zinc-800 bg-zinc-900/50 shadow-lg rounded-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Subscriber Portal</CardTitle>
                  <CardDescription className="text-base">
                    Subscribe to creators and access exclusive encrypted content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Subscribe to your favorite creators</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Purchase individual content pieces</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Securely decrypt and view encrypted content</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Manage your purchased items</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Subscriber Dashboard */}
              <SubscriberDashboard />
            </div>
          )}
        </div>
      </main>
    </>
  )
}
