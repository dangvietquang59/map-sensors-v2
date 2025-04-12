"use client"

import type React from "react"

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react"
import Image from "next/image"
import { sensorData } from "@/data/sensors"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize, Layers, Info, Map } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

interface SensorMapProps {
  selectedSensorId?: string | null
}

const SensorMap = forwardRef(({ selectedSensorId }: SensorMapProps, ref) => {
  const [selectedSensor, setSelectedSensor] = useState<SensorWithDetails | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mapScale, setMapScale] = useState(0.5)
  const [showLabels, setShowLabels] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredSensor, setHoveredSensor] = useState<string | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    focusOnSensor: (sensorId: string) => {
      const sensor = sensorsWithDetails.find((s) => s.id === sensorId)
      if (sensor && mapContainerRef.current) {
        handleSensorClick(sensor)

        // Center the map on the sensor
        const containerWidth = mapContainerRef.current.clientWidth
        const containerHeight = mapContainerRef.current.clientHeight

        setPosition({
          x: -(sensor.x * mapScale - containerWidth / 2),
          y: -(sensor.y * mapScale - containerHeight / 2),
        })
      }
    },
  }))

  // Effect to handle selected sensor from parent
  useEffect(() => {
    if (selectedSensorId) {
      const sensor = sensorsWithDetails.find((s) => s.id === selectedSensorId)
      if (sensor) {
        handleSensorClick(sensor)
      }
    }
  }, [selectedSensorId])

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setMapScale((prev) => Math.min(2.0, prev + 0.1))
  }

  const handleZoomOut = () => {
    setMapScale((prev) => Math.max(0.2, prev - 0.1))
  }

  const handleReset = () => {
    setMapScale(0.5)
    setPosition({ x: 0, y: 0 })
  }

  // Xử lý sự kiện cuộn chuột để zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    // Lấy vị trí chuột tương đối với container
    const rect = mapContainerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Tính toán vị trí chuột trên bản đồ trước khi zoom
    const mapX = (mouseX - position.x) / mapScale
    const mapY = (mouseY - position.y) / mapScale

    // Thay đổi tỷ lệ zoom
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    const newScale = Math.max(0.2, Math.min(2.0, mapScale + delta))

    // Tính toán vị trí mới để giữ con trỏ chuột ở cùng một vị trí trên bản đồ
    const newPosition = {
      x: mouseX - mapX * newScale,
      y: mouseY - mapY * newScale,
    }

    setMapScale(newScale)
    setPosition(newPosition)
  }

  return (
    <div className="relative overflow-hidden h-[80vh] bg-gray-50">
      <div className="flex gap-2 p-3 bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-gray-500" />
          <h2 className="font-medium">Bản Đồ Cảm Biến</h2>
        </div>

        <div className="flex items-center ml-auto gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomOut} className="h-8 w-8">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Thu nhỏ</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Badge variant="outline" className="h-8 px-2 flex items-center">
            {Math.round(mapScale * 100)}%
          </Badge>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomIn} className="h-8 w-8">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Phóng to</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleReset} className="h-8 w-8">
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Khôi phục</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showLabels ? "default" : "outline"}
                  size="icon"
                  onClick={() => setShowLabels(!showLabels)}
                  className="h-8 w-8 ml-2"
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showLabels ? "Ẩn nhãn" : "Hiện nhãn"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="p-2 bg-gray-100 text-sm text-gray-500 flex items-center gap-2">
        <Info className="h-4 w-4" />
        <span>Sử dụng cuộn chuột để phóng to/thu nhỏ và nhấn giữ để di chuyển bản đồ</span>
      </div>

      <div
        ref={mapContainerRef}
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          width: "100%",
          height: "calc(100% - 80px)",
          overflow: "hidden",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="absolute transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            width: `${3000 * mapScale}px`,
            height: `${2000 * mapScale}px`,
          }}
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/floor-plan-4bDm0VuxyQdwpgd5q1rehfoBKsuCl6.png"
            alt="Sơ đồ mặt bằng"
            fill
            style={{ objectFit: "contain" }}
            className="pointer-events-none"
            priority
          />

          {sensorsWithDetails.map((sensor) => (
            <div
              key={sensor.id}
              className="absolute group"
              style={{
                left: sensor.x * mapScale,
                top: sensor.y * mapScale,
                transform: "translate(-50%, -50%)",
                zIndex: hoveredSensor === sensor.id ? 50 : 1,
              }}
              onMouseEnter={() => setHoveredSensor(sensor.id)}
              onMouseLeave={() => setHoveredSensor(null)}
            >
              <div
                className={`cursor-pointer border-2 rounded-full flex items-center justify-center transition-all duration-200 ${getSensorColor(sensor.id)} group-hover:scale-125 group-hover:shadow-lg group-hover:z-10`}
                style={{
                  width: Math.max(15, sensor.width * mapScale),
                  height: Math.max(15, sensor.height * mapScale),
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSensorClick(sensor)
                }}
              >
                <span className="sr-only">{sensor.id}</span>
              </div>

              {/* Tooltip hiển thị khi hover */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap mb-1 shadow-lg">
                  {sensor.id}
                </div>
                <div className="w-2 h-2 bg-black transform rotate-45 mx-auto"></div>
              </div>

              {showLabels && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white px-1 text-xs border rounded mt-1 whitespace-nowrap shadow-sm">
                  {sensor.id}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${selectedSensor ? getStatusColor(selectedSensor.status) : ""}`}
              ></div>
              Thông số cảm biến {selectedSensor?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedSensor && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm text-gray-500">ID</div>
                  <div className="font-medium">{selectedSensor.id}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
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
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm text-gray-500">Nhiệt độ</div>
                  <div className="font-medium">{selectedSensor.temperature}°C</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm text-gray-500">Độ ẩm</div>
                  <div className="font-medium">{selectedSensor.humidity}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm text-gray-500">Tọa độ X</div>
                  <div className="font-medium">{selectedSensor.x}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm text-gray-500">Tọa độ Y</div>
                  <div className="font-medium">{selectedSensor.y}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="text-sm text-gray-500">Cập nhật lần cuối</div>
                <div className="font-medium">{selectedSensor.lastUpdated}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})

SensorMap.displayName = "SensorMap"

export default SensorMap
