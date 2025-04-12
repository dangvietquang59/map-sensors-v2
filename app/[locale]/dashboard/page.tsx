"use client"

import { useState, useRef } from "react"
import SensorMapV2 from "@/components/sensor-map-v2"
import SensorList from "@/components/sensor-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"
import LanguageSelector from "@/components/LanguageSelector"
import Image from "next/image"
import svgs from "@/assets/svgs"

export default function DashboardV2() {
  const t = useTranslations("sensor")
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null)
  const sensorMapRef = useRef<any>(null)

  const handleSelectSensor = (sensorId: string) => {
    setSelectedSensorId(sensorId)
    // Gọi phương thức trong SensorMap để hiển thị popup
    if (sensorMapRef.current) {
      sensorMapRef.current.focusOnSensor(sensorId)
    }
  }

  return (
    <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

       <div className="flex items-center justify-center"> <Image src={svgs.logo} alt="logo" width={200} height={200}/></div>
        <Tabs defaultValue="map" className="w-full">
      <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="map">{t("map")}</TabsTrigger>
            <TabsTrigger value="list">{t("list")}</TabsTrigger>
          </TabsList>
        <LanguageSelector/>

      </div>

          <TabsContent value="map" className="mt-4">
            <div className="border rounded-lg overflow-hidden bg-white">
              <SensorMapV2 ref={sensorMapRef} selectedSensorId={selectedSensorId} />
            </div>
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <SensorList onSelectSensor={handleSelectSensor} />
          </TabsContent>
        </Tabs>

    </div>
  )
}
