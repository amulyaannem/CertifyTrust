"use client"

import type React from "react"

import { useState } from "react"
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react"

interface ExcelUploadProps {
  onUpload: (data: any[]) => void
}

export default function ExcelUpload({ onUpload }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith(".xlsx")) {
      setError("Please upload an Excel (.xlsx) file")
      return
    }

    setFile(selectedFile)
    setError("")

    // Simulate parsing Excel file
    const mockData = [
      { name: "John Smith", email: "john@example.com", course: "Advanced React" },
      { name: "Sarah Johnson", email: "sarah@example.com", course: "Advanced React" },
      { name: "Michael Chen", email: "michael@example.com", course: "Advanced React" },
      { name: "Emma Davis", email: "emma@example.com", course: "Advanced React" },
      { name: "Alex Rodriguez", email: "alex@example.com", course: "Advanced React" },
    ]
    setPreview(mockData)
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
        <input type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" id="excel-upload" />
        <label htmlFor="excel-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <p className="font-semibold text-text mb-1">Click to upload or drag and drop</p>
          <p className="text-text-secondary text-sm">Excel files (.xlsx) only</p>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error rounded-lg text-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {file && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success rounded-lg text-success">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>{file.name} uploaded successfully</p>
        </div>
      )}

      {preview.length > 0 && (
        <div>
          <h3 className="font-semibold text-text mb-4">Preview (First 5 rows)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 font-semibold text-text">Name</th>
                  <th className="text-left py-2 px-4 font-semibold text-text">Email</th>
                  <th className="text-left py-2 px-4 font-semibold text-text">Course</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-surface">
                    <td className="py-2 px-4 text-text">{row.name}</td>
                    <td className="py-2 px-4 text-text-secondary">{row.email}</td>
                    <td className="py-2 px-4 text-text-secondary">{row.course}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <button onClick={() => onUpload(preview)} className="w-full btn-primary">
          Continue with {preview.length} Participants
        </button>
      )}
    </div>
  )
}
