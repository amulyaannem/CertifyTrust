"use client"

import { useState } from "react"

const templates = [
  {
    id: 1,
    name: "Professional Blue",
    description: "Classic professional design with blue accents",
    preview: "bg-gradient-to-br from-blue-600 to-blue-800",
  },
  {
    id: 2,
    name: "Modern Minimal",
    description: "Clean and minimal design with modern typography",
    preview: "bg-gradient-to-br from-gray-100 to-gray-200",
  },
  {
    id: 3,
    name: "Gold Premium",
    description: "Elegant design with gold accents",
    preview: "bg-gradient-to-br from-yellow-600 to-yellow-800",
  },
  {
    id: 4,
    name: "Green Eco",
    description: "Sustainable design with green theme",
    preview: "bg-gradient-to-br from-green-600 to-green-800",
  },
]

interface TemplateSelectorProps {
  onSelect: (template: any) => void
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const handleSelect = (template: any) => {
    setSelected(template.id)
    onSelect(template)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleSelect(template)}
            className={`cursor-pointer card-solid p-6 transition-all ${
              selected === template.id ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
            }`}
          >
            <div className={`w-full h-40 rounded-lg mb-4 ${template.preview}`}></div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-text">{template.name}</h3>
                <p className="text-text-secondary text-sm">{template.description}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected === template.id ? "border-primary bg-primary" : "border-border"
                }`}
              >
                {selected === template.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && <button className="w-full btn-primary">Continue with Selected Template</button>}
    </div>
  )
}
