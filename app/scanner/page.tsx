"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { QRScanner } from "@/components/scanner/qr-scanner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Scan, CheckCircle } from "lucide-react"

export default function ScannerPage() {
  return (
    <AuthGuard requiredRole="SCANNER">
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-amber-950/20">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Event Check-in Scanner</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Scan QR code tickets to validate and check in attendees securely
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <QRScanner />
            </div>

            <div className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Shield className="h-5 w-5 mr-2 text-yellow-500" />
                    How it Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Scan className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Scan QR Code</p>
                      <p className="text-sm text-gray-300">Point camera at attendee's ticket QR code</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Instant Validation</p>
                      <p className="text-sm text-gray-300">System validates ticket and prevents duplicate entries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Scanner Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2 text-gray-300">
                    <p>• Ensure good lighting for best results</p>
                    <p>• Hold device steady while scanning</p>
                    <p>• Valid tickets show green confirmation</p>
                    <p>• Invalid/used tickets show red warning</p>
                    <p>• Results auto-clear after 5 seconds</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-500/10 border border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Security Notice</CardTitle>
                  <CardDescription className="text-gray-300">
                    All ticket validations are logged and secured with Civic Auth
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
