"use client"

import { useState } from "react"

type AnimatedSensorProps = {
  id: string
  color: string
  size: number
  onClick: () => void
}

export default function AnimatedSensor({ id, color, size, onClick }: AnimatedSensorProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative">
      {/* Pulse effect for active sensors */}
      <div
        className="absolute rounded-full opacity-0"
        style={{
          backgroundColor: color,
          width: size,
          height: size,
          top: 0,
          left: 0,
          animation: isHovered ? "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" : "none",
          opacity: isHovered ? 0.5 : 0,
        }}
      />

      {/* Main sensor point */}
      <div
        className={`rounded-full border-2 transition-all duration-300 cursor-pointer`}
        style={{
          backgroundColor: color,
          borderColor: `${color}80`,
          width: size,
          height: size,
          transform: isHovered ? "scale(1.5)" : "scale(1)",
          boxShadow: isHovered ? `0 0 10px ${color}` : "none",
          zIndex: isHovered ? 50 : 1,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      />

      {/* Tooltip that appears on hover */}
      <div
        className="absolute left-1/2 whitespace-nowrap pointer-events-none transition-all duration-200 z-50"
        style={{
          transform: "translateX(-50%)",
          top: -size - 8,
          opacity: isHovered ? 1 : 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        {id}
      </div>
    </div>
  )
}
