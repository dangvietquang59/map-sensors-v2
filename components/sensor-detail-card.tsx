type SensorDetailProps = {
  id: string
  temperature?: number
  humidity?: number
  status: "normal" | "warning" | "critical"
  lastUpdated: string
  x: number
  y: number
}

export default function SensorDetailCard({ id, temperature, humidity, status, lastUpdated, x, y }: SensorDetailProps) {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "Bình thường"
      case "warning":
        return "Cảnh báo"
      case "critical":
        return "Nguy hiểm"
      default:
        return "Không xác định"
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 p-3 rounded-lg border">
          <div className="text-sm text-gray-500">ID</div>
          <div className="font-medium">{id}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border">
          <div className="text-sm text-gray-500">Trạng thái</div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></span>
            <span className="font-medium capitalize">{getStatusText(status)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 p-3 rounded-lg border">
          <div className="text-sm text-gray-500">Nhiệt độ</div>
          <div className="font-medium">{temperature}°C</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border">
          <div className="text-sm text-gray-500">Độ ẩm</div>
          <div className="font-medium">{humidity}%</div>
        </div>
      </div>

      {/* <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 p-3 rounded-lg border">
          <div className="text-sm text-gray-500">Tọa độ X</div>
          <div className="font-medium">{x}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border">
          <div className="text-sm text-gray-500">Tọa độ Y</div>
          <div className="font-medium">{y}</div>
        </div>
      </div> */}

      <div className="bg-gray-50 p-3 rounded-lg border">
        <div className="text-sm text-gray-500">Cập nhật lần cuối</div>
        <div className="font-medium">{lastUpdated}</div>
      </div>
    </div>
  )
}
