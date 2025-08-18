"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface ScanHistoryItem {
  id: string
  timestamp: Date
  valid: boolean
  message: string
  eventTitle?: string
}

export function ScanHistory() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([])

  // This would typically connect to a real-time database or API
  // For demo purposes, we'll use local state
  const addToHistory = (item: Omit<ScanHistoryItem, "id" | "timestamp">) => {
    const newItem: ScanHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setHistory((prev) => [newItem, ...prev.slice(0, 9)]) // Keep last 10 items
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Scans
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No scans yet</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {item.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{item.eventTitle || "Unknown Event"}</p>
                    <p className="text-sm text-gray-600">{item.message}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={item.valid ? "default" : "destructive"}>{item.valid ? "Valid" : "Invalid"}</Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.timestamp.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
