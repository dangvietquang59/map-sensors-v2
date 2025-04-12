"use client"

import { useState } from "react"
import { sensorData } from "@/data/sensors"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

type SensorListProps = {
  onSelectSensor: (sensorId: string) => void
}

export default function SensorList({ onSelectSensor }: SensorListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSensors = sensorData.filter((sensor) => sensor.id.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm cảm biến theo ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Tọa độ X</th>
              <th className="text-left p-2">Tọa độ Y</th>
              <th className="text-left p-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredSensors.map((sensor) => (
              <tr key={sensor.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{sensor.id}</td>
                <td className="p-2">{sensor.x}</td>
                <td className="p-2">{sensor.y}</td>
                <td className="p-2 text-right">
                  <Button variant="outline" size="sm" onClick={() => onSelectSensor(sensor.id)}>
                    Xem
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSensors.length === 0 && (
          <div className="text-center py-4 text-gray-500">Không tìm thấy cảm biến nào</div>
        )}
      </div>
    </div>
  )
}
