import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Event Manager",
    company: "Tech Conference 2025",
    content:
      "CertiTrust made certificate distribution effortless. Our 500+ attendees received verified certificates instantly.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Training Director",
    company: "Global Learning Institute",
    content:
      "The verification process is seamless. Our partners trust the authenticity of our certificates completely.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "HR Manager",
    company: "Enterprise Solutions Inc",
    content:
      "Professional, secure, and reliable. CertiTrust has become our go-to platform for all certification needs.",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text mb-4">Trusted by Organizations</h2>
          <p className="text-xl text-text-secondary">See what our users have to say</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card-solid p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-text-secondary mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-text">{testimonial.name}</p>
                <p className="text-sm text-text-secondary">{testimonial.role}</p>
                <p className="text-sm text-text-secondary">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
