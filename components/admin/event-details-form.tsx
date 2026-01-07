"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Building2, User, FileText } from "lucide-react"

interface EventDetailsFormProps {
  onSubmit: (data: any) => void
}

export default function EventDetailsForm({ onSubmit }: EventDetailsFormProps) {
  const [formData, setFormData] = useState({
    eventName: "",
    organization: "",
    date: "",
    signatory: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text mb-2">Event Name</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            placeholder="e.g., Annual Conference 2025"
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-2">Organization</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            placeholder="e.g., Tech Academy"
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-2">Event Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text mb-2">Authorized Signatory</label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            value={formData.signatory}
            onChange={(e) => setFormData({ ...formData, signatory: e.target.value })}
            placeholder="e.g., John Director"
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <button type="submit" className="w-full btn-primary">
        Continue to Upload
      </button>
    </form>
  )
}
