"use client"

import { useState } from "react"
import { Wand2 } from "lucide-react"
import Navbar from "@/components/navbar"
import EventDetailsForm from "@/components/admin/event-details-form"
import ExcelUpload from "@/components/admin/excel-upload"
import TemplateSelector from "@/components/admin/template-selector"
import GenerationResult from "@/components/admin/generation-result"

export default function AdminDashboard() {
  const [step, setStep] = useState(1)
  const [eventData, setEventData] = useState(null)
  const [excelData, setExcelData] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)

  const handleGenerateCertificates = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/generate-certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventData, excelData, selectedTemplate }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          count: data.count,
          message: data.message,
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to generate certificates",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setResult({
        success: false,
        message: "Failed to generate certificates",
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">Certificate Generation</h1>
          <p className="text-text-secondary">Create and manage digital certificates</p>
        </div>

        {result ? (
          <GenerationResult result={result} onReset={() => setResult(null)} />
        ) : (
          <div className="space-y-8">
            {/* Step 1: Event Details */}
            <div className="card-solid p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h2 className="text-2xl font-bold text-text">Event Details</h2>
              </div>
              <EventDetailsForm
                onSubmit={(data) => {
                  setEventData(data)
                  setStep(2)
                }}
              />
            </div>

            {/* Step 2: Excel Upload */}
            {step >= 2 && (
              <div className="card-solid p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-text">Upload Participant Data</h2>
                </div>
                <ExcelUpload
                  onUpload={(data) => {
                    setExcelData(data)
                    setStep(3)
                  }}
                />
              </div>
            )}

            {/* Step 3: Template Selection */}
            {step >= 3 && (
              <div className="card-solid p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <h2 className="text-2xl font-bold text-text">Select Certificate Template</h2>
                </div>
                <TemplateSelector onSelect={setSelectedTemplate} />
              </div>
            )}

            {/* Step 4: Generate */}
            {step >= 3 && selectedTemplate && (
              <div className="card-solid p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <h2 className="text-2xl font-bold text-text">Generate Certificates</h2>
                </div>

                <div className="bg-surface p-6 rounded-lg mb-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-text-secondary text-sm">Event</p>
                      <p className="font-semibold text-text">{eventData?.eventName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-sm">Participants</p>
                      <p className="font-semibold text-text">{excelData?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-sm">Template</p>
                      <p className="font-semibold text-text">{selectedTemplate?.name || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateCertificates}
                  disabled={generating}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate All Certificates
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
