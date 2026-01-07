import { Shield, Zap, Lock, CheckCircle2 } from "lucide-react"

const benefits = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Military-grade encryption and security protocols to protect your certificates",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Generate hundreds of certificates in seconds with our optimized system",
  },
  {
    icon: Lock,
    title: "Tamper-Proof",
    description: "Cryptographically signed certificates that cannot be forged or altered",
  },
  {
    icon: CheckCircle2,
    title: "Easy Verification",
    description: "Simple one-click verification process for recipients and validators",
  },
]

export default function BenefitsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text mb-4">Why Choose CertiTrust?</h2>
          <p className="text-xl text-text-secondary">Industry-leading features for certificate management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div key={index} className="card-solid p-6 hover:shadow-lg transition-shadow">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-lg text-text mb-2">{benefit.title}</h3>
                <p className="text-text-secondary text-sm">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
