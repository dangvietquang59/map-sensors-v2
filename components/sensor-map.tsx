"use client"

import { useState } from "react"
import Image from "next/image"
import { sensorData } from "@/data/sensors"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Sensor = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

type SensorWithDetails = Sensor & {
  temperature?: number
  humidity?: number
  status: "normal" | "warning" | "critical"
  lastUpdated: string
}

// Thêm dữ liệu mẫu cho các cảm biến
const sensorsWithDetails: SensorWithDetails[] = sensorData.map((sensor) => ({
  ...sensor,
  temperature: Math.round(Math.random() * 30 + 20), // 20-50°C
  humidity: Math.round(Math.random() * 50 + 30), // 30-80%
  status: ["normal", "warning", "critical"][Math.floor(Math.random() * 3)] as "normal" | "warning" | "critical",
  lastUpdated: new Date().toLocaleString("vi-VN"),
}))

export default function SensorMap() {
  const [selectedSensor, setSelectedSensor] = useState<SensorWithDetails | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mapScale, setMapScale] = useState(0.5)

  const handleSensorClick = (sensor: SensorWithDetails) => {
    setSelectedSensor(sensor)
    setIsDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSensorColor = (sensorId: string) => {
    if (sensorId.includes("B-TH")) {
      return "bg-red-500 border-red-700"
    } else if (sensorId.includes("G-TH")) {
      return "bg-green-500 border-green-700"
    } else {
      return "bg-blue-500 border-blue-700"
    }
  }

  return (
    <div className="relative overflow-auto">
      <div className="flex gap-2 p-2 bg-gray-100 border-b sticky top-0 z-10">
        <button
          onClick={() => setMapScale((prev) => Math.max(0.2, prev - 0.1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          -
        </button>
        <button
          onClick={() => setMapScale((prev) => Math.min(1.5, prev + 0.1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          +
        </button>
        <span className="px-2 py-1">{Math.round(mapScale * 100)}%</span>
      </div>

      <div
        className="relative"
        style={{
          width: `${3000 * mapScale}px`,
          height: `${2000 * mapScale}px`,
        }}
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MB1UhdiFwEm3BA6W4dyZwfAoKFDNsr.png"
          alt="Sơ đồ mặt bằng"
          fill
          style={{ objectFit: "contain" }}
          className="pointer-events-none"
        />

        {sensorsWithDetails.map((sensor) => (
          <div
            key={sensor.id}
            className="absolute group"
            style={{
              left: sensor.x * mapScale,
              top: sensor.y * mapScale,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={`cursor-pointer border-2 rounded-full flex items-center justify-center transition-all duration-200 ${getSensorColor(sensor.id)} group-hover:scale-125 group-hover:shadow-lg`}
              style={{
                width: sensor.width * mapScale,
                height: sensor.height * mapScale,
              }}
              onClick={() => handleSensorClick(sensor)}
            >
              <span className="sr-only">{sensor.id}</span>
            </div>

            {/* Tooltip hiển thị khi hover */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap mb-1">{sensor.id}</div>
              <div className="w-2 h-2 bg-black transform rotate-45 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thông số cảm biến {selectedSensor?.id}</DialogTitle>
          </DialogHeader>
          {selectedSensor && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-sm text-gray-500">ID</div>
                  <div className="font-medium">{selectedSensor.id}</div>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-sm text-gray-500">Trạng thái</div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(selectedSensor.status)}`}></span>
                    <span className="font-medium capitalize">
                      {selectedSensor.status === "normal"
                        ? "Bình thường"
                        : selectedSensor.status === "warning"
                          ? "Cảnh báo"
                          : "Nguy hiểm"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-sm text-gray-500">Nhiệt độ</div>
                  <div className="font-medium">{selectedSensor.temperature}°C</div>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-sm text-gray-500">Độ ẩm</div>
                  <div className="font-medium">{selectedSensor.humidity}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-sm text-gray-500">Tọa độ X</div>
                  <div className="font-medium">{selectedSensor.x}</div>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-sm text-gray-500">Tọa độ Y</div>
                  <div className="font-medium">{selectedSensor.y}</div>
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded">
                <div className="text-sm text-gray-500">Cập nhật lần cuối</div>
                <div className="font-medium">{selectedSensor.lastUpdated}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
