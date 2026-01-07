import { Upload, Wand2, Download, ShieldCheck } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Data",
    description: "Import participant data via Excel file",
  },
  {
    icon: Wand2,
    title: "Select Template",
    description: "Choose from professional certificate designs",
  },
  {
    icon: Download,
    title: "Generate",
    description: "Instantly create all certificates",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    description: "Recipients can verify authenticity anytime",
  },
]

export default function ProcessSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text mb-4">Simple 4-Step Process</h2>
          <p className="text-xl text-text-secondary">Get your certificates ready in minutes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <div className="card-solid p-8 text-center h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-light rounded-full mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-lg text-text mb-2">{step.title}</h3>
                  <p className="text-text-secondary text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
