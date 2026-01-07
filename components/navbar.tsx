"use client"

import Link from "next/link"
import { Shield } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-text">CertiTrust</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-text-secondary hover:text-text transition-colors">
              Sign In
            </Link>
            <Link href="/verify" className="btn-primary text-sm">
              Verify Certificate
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
