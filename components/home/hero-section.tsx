import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4 px-4 py-2 bg-primary-light rounded-full">
              <span className="text-primary font-semibold text-sm">Secure & Trustworthy</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
              Digital Certificates You Can Trust
            </h1>

            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              CertiTrust is your secure platform for generating, managing, and verifying digital certificates with
              enterprise-grade security and complete transparency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="btn-primary inline-flex items-center justify-center gap-2">
                Generate Certificates
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/verify" className="btn-secondary inline-flex items-center justify-center gap-2">
                Verify Certificate
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-400/20 rounded-3xl blur-3xl"></div>
            <div className="relative card-glass p-8">
              <div className="space-y-4">
                <div className="h-32 bg-gradient-to-br from-primary to-blue-600 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-border rounded w-3/4"></div>
                  <div className="h-4 bg-border rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
