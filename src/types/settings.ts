export interface SalonSettings {
    id: number;
    salonName: string;
    phone: string;
    email: string;
    address: string;
    logoUrl: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    whatsappNumber: string | null;
    allowCustomerChooseEmployee: boolean;
    enableOnlinePayment: boolean;
    bookingIntervalMinutes: number;
    appointmentBufferMinutes: number;
    appointmentGracePeriodMinutes: number;
    createdAt: string;
    updatedAt: string;
}

export type UpdateSalonSettingsInput = Omit<SalonSettings, "id" | "logoUrl" | "createdAt" | "updatedAt">;
export interface SalonSettingsResponseData { settings: SalonSettings; }
