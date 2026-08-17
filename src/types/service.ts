export interface SalonService {
    id: number;
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
    imageUrl: string;
    isActive: boolean;
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
}

export interface ServiceResponseData { service: SalonService; }
export interface ServicesResponseData { services: SalonService[]; }
