"use client"

import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface QRCodeDisplayProps {
  qrCode: string
  eventTitle: string
  eventDate: string
  eventLocation: string
}

export function QRCodeDisplay({ qrCode, eventTitle, eventDate, eventLocation }: QRCodeDisplayProps) {
  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `ticket-${eventTitle.replace(/\s+/g, "-").toLowerCase()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-gray-900">Your Ticket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <QRCodeSVG
            id="qr-code-svg"
            value={qrCode}
            size={200}
            level="H"
            includeMargin={true}
            className="mx-auto border rounded-lg"
          />
        </div>

        <div className="text-center space-y-2">
          <h3 className="font-semibold text-gray-900">{eventTitle}</h3>
          <p className="text-sm text-gray-600">{eventDate}</p>
          <p className="text-sm text-gray-600">{eventLocation}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800 text-center">Present this QR code at the event entrance for check-in</p>
        </div>

        <Button onClick={downloadQR} variant="outline" className="w-full bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Download Ticket
        </Button>
      </CardContent>
    </Card>
  )
}
