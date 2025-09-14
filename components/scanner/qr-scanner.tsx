"use client"

import { useState } from "react"
import { QrReader } from "@blackbox-vision/react-qr-reader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, CheckCircle, XCircle, RotateCcw } from "lucide-react"

interface ScanResult {
  valid: boolean
  message: string
  ticket?: any
  event?: any
}

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState<string>("")

  const validateTicket = async (qrCode: string) => {
    if (qrCode === lastScannedCode) return // Prevent duplicate scans

    setIsValidating(true)
    setLastScannedCode(qrCode)

    try {
      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrCode }),
      })

      const data = await response.json()

      setScanResult({
        valid: data.valid,
        message: data.message,
        ticket: data.ticket,
        event: data.event,
      })

      // Auto-clear result after 5 seconds for valid tickets
      if (data.valid) {
        setTimeout(() => {
          setScanResult(null)
          setLastScannedCode("")
        }, 5000)
      }
    } catch (error) {
      console.error("Validation error:", error)
      setScanResult({
        valid: false,
        message: "Validation failed - please try again",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleScan = (result: any) => {
    if (result && !isValidating) {
      validateTicket(result.text)
    }
  }

  const handleError = (error: any) => {
    console.error("Scanner error:", error)
  }

  const startScanning = () => {
    setIsScanning(true)
    setScanResult(null)
    setLastScannedCode("")
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  const resetScanner = () => {
    setScanResult(null)
    setLastScannedCode("")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>QR Code Scanner</span>
            <div className="flex space-x-2">
              <Button onClick={resetScanner} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              {isScanning ? (
                <Button onClick={stopScanning} variant="destructive" size="sm">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button onClick={startScanning} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isScanning ? (
            <div className="space-y-4">
              <div className="relative aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden">
                <QrReader
                  onResult={handleScan}
                  onError={handleError}
                  constraints={{
                    facingMode: "environment",
                  }}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                </div>
              </div>
              <p className="text-center text-gray-600">Position the QR code within the frame</p>
              {isValidating && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Validating ticket...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Click "Start" to begin scanning QR codes</p>
              <p className="text-sm text-gray-500">Make sure to allow camera access when prompted</p>
            </div>
          )}
        </CardContent>
      </Card>

      {scanResult && (
        <Card className={`border-2 ${scanResult.valid ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              {scanResult.valid ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              <Badge variant={scanResult.valid ? "default" : "destructive"} className="text-lg px-4 py-2">
                {scanResult.valid ? "VALID TICKET" : "INVALID TICKET"}
              </Badge>
            </div>

            <p
              className={`text-center text-lg font-medium mb-4 ${scanResult.valid ? "text-green-800" : "text-red-800"}`}
            >
              {scanResult.message}
            </p>

            {scanResult.event && (
              <div className="bg-white rounded-lg p-4 space-y-3">
                {scanResult.user && (
                  <div className="border-b pb-3 mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{scanResult.user.name}</h3>
                    <p className="text-sm text-gray-600">{scanResult.user.email}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{scanResult.event.title}</h4>
                  <p className="text-sm text-gray-600">{scanResult.event.location}</p>
                  <p className="text-sm text-gray-600">
                    {scanResult.event.date && typeof scanResult.event.date.toDate === 'function' 
                      ? scanResult.event.date.toDate().toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : new Date(scanResult.event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                    }
                  </p>
                </div>
              </div>
            )}

            {scanResult.valid && (
              <p className="text-center text-sm text-green-700 mt-4">
                This result will automatically clear in a few seconds
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
