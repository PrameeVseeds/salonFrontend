export interface SalonService {
    id: number;
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
    imageUrl: string;
    isActive: boolean;
    maxConcurrentAppointments: number | null;
    assignedEmployeeCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface SaveServiceInput {
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
    imageUrl: string;
    isActive: boolean;
    maxConcurrentAppointments: number | null;
}

export interface ServiceResponseData { service: SalonService; }
export interface ServicesResponseData { services: SalonService[]; }
