export interface SalonSettings {
    id: number;
    salonName: string;
    phone: string;
    email: string;
    address: string;
    mapUrl: string | null;
    logoUrl: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    whatsappNumber: string | null;
    allowCustomerChooseEmployee: boolean;
    enableOnlinePayment: boolean;
    bookingIntervalMinutes: number;
    appointmentBufferMinutes: number;
    appointmentGracePeriodMinutes: number;
    appointmentReminderMinutes: number;
    enableWhatsAppAppointmentReminders: boolean;
    appointmentConfirmationMessage: string;
    appointmentReminderMessage: string;
    appointmentCancellationMessage: string;
    createdAt: string;
    updatedAt: string;
}

export type UpdateSalonSettingsInput = Omit<SalonSettings, "id" | "logoUrl" | "createdAt" | "updatedAt">;
export interface SalonSettingsResponseData { settings: SalonSettings; }
