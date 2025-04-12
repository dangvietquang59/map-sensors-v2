"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import svgs from "@/assets/svgs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageSelector() {
  const t = useTranslations("language");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getLangFromPath = useCallback(() => {
    const lang = pathname.split("/")[1];
    return ["vn", "en", "zh"].includes(lang) ? lang : "vn";
  }, [pathname]);

  const [language, setLanguage] = useState<string>(getLangFromPath());

  useEffect(() => {
    const currentLang = getLangFromPath();
    if (currentLang !== language) {
      setLanguage(currentLang);
    }
  }, [pathname, getLangFromPath, language]);

  const handleChangeLanguage = (lang: string) => {
    const segments = pathname.split("/");
    segments[1] = lang;
    const basePath = segments.join("/");

    const queryString = searchParams.toString();
    const newPath = queryString ? `${basePath}?${queryString}` : basePath;

    setLanguage(lang);
    router.push(newPath);
  };

  return (
    <div className="flex items-center justify-end gap-4 mt-[20px] mr-[20px]">
      <Select value={language} onValueChange={handleChangeLanguage}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="vn">
            <div className="flex items-center gap-2">
              <Image src={svgs.vn} alt="Vietnam" width={20} height={15} />
              {t("vn")}
            </div>
          </SelectItem>
          <SelectItem value="en">
            <div className="flex items-center gap-2">
              <Image src={svgs.en} alt="English" width={20} height={15} />
              {t("en")}
            </div>
          </SelectItem>
          <SelectItem value="zh">
            <div className="flex items-center gap-2">
              <Image src={svgs.tw} alt="Chinese" width={20} height={15} />
              {t("zh")}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
