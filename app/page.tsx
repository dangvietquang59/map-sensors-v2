import SensorMap from "@/components/sensor-map-enhanced"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-white border-b p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Hệ Thống Giám Sát Cảm Biến</h1>
          <div className="text-sm text-gray-500">Phiên bản 1.0</div>
        </div>
      </header>

      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <SensorMap />
          </div>
        </div>
      </div>
    </main>
  )
}
