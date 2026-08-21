import { useEffect, useState, type CSSProperties } from "react";
import { getPublicThemeSettings } from "../services/themeSettingsService";
import { getPublicSalonSettings } from "../services/settingsService";
import type { ThemeSettings } from "../types/themeSettings";

const defaults = {
  primaryColor: "#2B2924",
  secondaryColor: "#1C1C1A",
  accentColor: "#C5962E",
};

export const usePublicTheme = () => {
  const [theme, setTheme] = useState<Pick<ThemeSettings, "primaryColor" | "secondaryColor" | "accentColor" | "heroMediaType" | "heroMediaUrl">>({
    ...defaults,
    heroMediaType: "Image",
    heroMediaUrl: null,
  });
  const [brand, setBrand] = useState({ salonName: "Salon", logoUrl: null as string | null });

  useEffect(() => {
    let active = true;
    getPublicThemeSettings()
      .then(({ data }) => {
        if (active)
          setTheme(data.themeSettings);
      })
      .catch(() => undefined);
    getPublicSalonSettings()
      .then(({ data }) => {
        if (active)
          setBrand({ salonName: data.settings.salonName, logoUrl: data.settings.logoUrl });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const style = {
    "--customer-primary": theme.primaryColor,
    "--customer-secondary": theme.secondaryColor,
    "--customer-accent": theme.accentColor,
  } as CSSProperties;

  return { theme, brand, style };
};
