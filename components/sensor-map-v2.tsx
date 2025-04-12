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
import SensorDetailCard from "./sensor-detail-card"
import AnimatedSensor from "./animated-sensor"
import { useTranslations } from "next-intl"

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

const SensorMapV2 = forwardRef(({ selectedSensorId }: SensorMapProps, ref) => {
  const t = useTranslations("sensor")
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

  const getSensorColor = (sensorId: string) => {
    // Màu cơ bản dựa trên loại cảm biến
    let baseColor = ""

    if (sensorId.includes("-2F")) {
      baseColor = "#3b82f6" // red-500
    } else if (sensorId.includes("-1F")) {
      baseColor = "#22c55e" // green-500
    } else {
      baseColor = "#ef4444" // blue-500
    }

  
    return baseColor
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "DIV") {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
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

  return (
    <div className="relative overflow-hidden h-[80vh] bg-gray-50">
      <div className="flex gap-2 p-3 bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-gray-500" />
          <h2 className="font-medium">{t("sensorMap")}</h2>
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
        <span>{t("useMouse")}</span>
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
              className="absolute"
              style={{
                left: sensor.x * mapScale,
                top: sensor.y * mapScale,
                transform: "translate(-50%, -50%)",
                zIndex: hoveredSensor === sensor.id ? 50 : 1,
              }}
            >
              <AnimatedSensor
                id={sensor.id}
                color={getSensorColor(sensor.id)}
                size={Math.max(15, sensor.width * mapScale)}
                onClick={() => handleSensorClick(sensor)}
              />

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
            <SensorDetailCard
              id={selectedSensor.id}
              temperature={selectedSensor.temperature}
              humidity={selectedSensor.humidity}
              status={selectedSensor.status}
              lastUpdated={selectedSensor.lastUpdated}
              x={selectedSensor.x}
              y={selectedSensor.y}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})

SensorMapV2.displayName = "SensorMapV2"

export default SensorMapV2
