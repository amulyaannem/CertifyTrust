import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { eventData, excelData, selectedTemplate } = await request.json()

    // Validate input
    if (!eventData || !excelData || !selectedTemplate) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Here you would integrate with Qoder API or your certificate generation service
    // For now, we'll simulate the generation
    const certificates = excelData.map((participant: any, index: number) => ({
      id: `cert-${Date.now()}-${index}`,
      participantName: participant.name,
      participantEmail: participant.email,
      eventName: eventData.eventName,
      organization: eventData.organization,
      date: eventData.date,
      signatory: eventData.signatory,
      template: selectedTemplate.name,
      verificationCode: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
    }))

    // Store certificates in a database or file system
    // For now, we'll just return the generated certificates
    return NextResponse.json({
      success: true,
      count: certificates.length,
      certificates: certificates,
      message: "Certificates Generated Successfully",
    })
  } catch (error) {
    console.error("Certificate generation error:", error)
    return NextResponse.json({ error: "Failed to generate certificates" }, { status: 500 })
  }
}
