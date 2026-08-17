export type HeroMediaType = "Image" | "Video";

export interface ThemeSettings {
    id: number;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    heroMediaType: HeroMediaType;
    heroMediaUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateThemeSettingsInput {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    heroMediaType: HeroMediaType;
}

export interface ThemeSettingsResponseData { themeSettings: ThemeSettings; }
