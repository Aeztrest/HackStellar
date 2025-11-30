"use client"

import { useState, useEffect } from "react"

export interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  }[type]

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300`}
    >
      {message}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null)

  const showToast = (props: ToastProps) => {
    setToast(props)
  }

  const hideToast = () => {
    setToast(null)
  }

  return { toast, showToast, hideToast }
}
