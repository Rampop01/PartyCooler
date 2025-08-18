"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scan, Shield, Activity, Clock } from "lucide-react"

export function ScannerDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scanner Dashboard</h1>
        <p className="text-lg text-gray-600">Quick access to scanning tools and recent activity</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Scan className="h-6 w-6 mr-2" />
              QR Code Scanner
            </CardTitle>
            <CardDescription className="text-blue-700">Scan attendee tickets for event check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/scanner">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                Open Scanner
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-6 w-6 mr-2" />
              Scanner Status
            </CardTitle>
            <CardDescription>System status and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Camera Access:</span>
              <span className="text-green-600 font-medium">Ready</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Connection:</span>
              <span className="text-green-600 font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Scan:</span>
              <span className="text-gray-600">Never</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Scanner Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How to Scan</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>1. Click "Open Scanner" to start</li>
                <li>2. Allow camera access when prompted</li>
                <li>3. Point camera at QR code on ticket</li>
                <li>4. Wait for automatic validation</li>
                <li>5. Check result and allow entry if valid</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Validation Results</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Green = Valid ticket, allow entry</li>
                <li>• Red = Invalid/used ticket, deny entry</li>
                <li>• Results auto-clear after 5 seconds</li>
                <li>• All scans are logged for security</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recent scanning activity</p>
            <p className="text-sm text-gray-400 mt-1">Start scanning to see activity here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
