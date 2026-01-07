"use client"

import type React from "react"

import { useState } from "react"
import { Upload, ShieldCheck, AlertTriangle, CheckCircle2, Search } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function VerifyPage() {
  const [verificationMethod, setVerificationMethod] = useState<"pdf" | "id">("pdf")
  const [file, setFile] = useState<File | null>(null)
  const [certificateId, setCertificateId] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleVerify = async () => {
    if (!file && !certificateId) return

    setVerifying(true)
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: verificationMethod,
          certificateId: certificateId || undefined,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setResult({
        valid: false,
        message: "Certificate verification failed",
      })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {!result ? (
            <div className="card-solid p-12">
              <h1 className="text-4xl font-bold text-text mb-2 text-center">Verify a Certificate</h1>
              <p className="text-text-secondary text-center mb-8">
                Verify certificate authenticity using PDF upload or certificate ID
              </p>

              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => {
                    setVerificationMethod("pdf")
                    setFile(null)
                    setCertificateId("")
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    verificationMethod === "pdf"
                      ? "bg-primary text-white"
                      : "bg-surface text-text hover:bg-surface-secondary"
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload PDF
                </button>
                <button
                  onClick={() => {
                    setVerificationMethod("id")
                    setFile(null)
                    setCertificateId("")
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    verificationMethod === "id"
                      ? "bg-primary text-white"
                      : "bg-surface text-text hover:bg-surface-secondary"
                  }`}
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  Certificate ID
                </button>
              </div>

              {verificationMethod === "pdf" ? (
                <>
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer mb-8">
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="cert-upload" />
                    <label htmlFor="cert-upload" className="cursor-pointer">
                      <Upload className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                      <p className="font-semibold text-text mb-1">Click to upload or drag and drop</p>
                      <p className="text-text-secondary text-sm">PDF files only</p>
                    </label>
                  </div>

                  {file && (
                    <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg text-success flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <p>{file.name}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-text mb-2">Certificate ID</label>
                  <input
                    type="text"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                    placeholder="e.g., CERT-2025-001234"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-text-secondary text-sm mt-2">Enter the certificate ID to verify</p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={verificationMethod === "pdf" ? !file || verifying : !certificateId || verifying}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify Certificate
                  </>
                )}
              </button>
            </div>
          ) : result.valid ? (
            <div className="card-solid p-12">
              <div className="text-center mb-8">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-text mb-2">Certificate Verified</h2>
                <p className="text-text-secondary">This certificate is authentic and valid</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-text-secondary text-sm">Participant Name</p>
                  <p className="font-semibold text-text">{result.participantName}</p>
                </div>
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-text-secondary text-sm">Event</p>
                  <p className="font-semibold text-text">{result.eventName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface p-4 rounded-lg">
                    <p className="text-text-secondary text-sm">Date</p>
                    <p className="font-semibold text-text">{result.date}</p>
                  </div>
                  <div className="bg-surface p-4 rounded-lg">
                    <p className="text-text-secondary text-sm">Organization</p>
                    <p className="font-semibold text-text">{result.organization}</p>
                  </div>
                </div>
                <div className="bg-surface p-4 rounded-lg">
                  <p className="text-text-secondary text-sm">Certificate ID</p>
                  <p className="font-mono text-sm font-semibold text-text">{result.certificateId}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setResult(null)
                  setFile(null)
                  setCertificateId("")
                }}
                className="w-full btn-secondary"
              >
                Verify Another Certificate
              </button>
            </div>
          ) : (
            <div className="card-solid p-12">
              <div className="text-center mb-8">
                <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-text mb-2">Invalid Certificate</h2>
                <p className="text-text-secondary">{result.message || "This certificate could not be verified"}</p>
              </div>

              <button
                onClick={() => {
                  setResult(null)
                  setFile(null)
                  setCertificateId("")
                }}
                className="w-full btn-primary"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
