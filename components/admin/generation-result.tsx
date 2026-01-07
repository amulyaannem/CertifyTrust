"use client"

import { CheckCircle2, Download, Mail } from "lucide-react"

interface GenerationResultProps {
  result: {
    success: boolean
    count?: number
    message: string
  }
  onReset: () => void
}

export default function GenerationResult({ result, onReset }: GenerationResultProps) {
  return (
    <div className="card-solid p-12 text-center max-w-2xl mx-auto">
      <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-6" />
      <h2 className="text-3xl font-bold text-text mb-2">{result.message}</h2>
      <p className="text-4xl font-bold text-primary mb-8">{result.count} Certificates</p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <button className="btn-primary inline-flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Download All (ZIP)
        </button>
        <button className="btn-secondary inline-flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" />
          Send via Email
        </button>
      </div>

      <button onClick={onReset} className="text-primary font-semibold hover:underline">
        Generate More Certificates
      </button>
    </div>
  )
}
