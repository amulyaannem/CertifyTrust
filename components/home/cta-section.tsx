import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="card-glass p-12 text-center">
          <h2 className="text-4xl font-bold text-text mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands of organizations using CertiTrust for secure certificate management
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="btn-primary inline-flex items-center justify-center gap-2">
              Start Generating
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="btn-secondary">Schedule a Demo</button>
          </div>
        </div>
      </div>
    </section>
  )
}
