export interface SalonService {
    id: number;
    categoryId: number;
    categoryName: string;
    categoryIsActive: boolean;
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
    subServices: SubService[];
}

export interface SubService {
    id: number;
    serviceId: number;
    name: string;
    durationMinutes: number;
    price: number;
    imageUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SaveSubServiceInput {
    name: string;
    durationMinutes: number;
    price: number;
    imageUrl: string;
    isActive: boolean;
}

export interface SaveServiceInput {
    categoryId: number;
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

export interface ServiceCategory {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    serviceCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface SaveServiceCategoryInput {
    name: string;
    description: string;
    isActive: boolean;
}

export interface ServiceCategoryResponseData { category: ServiceCategory; }
export interface ServiceCategoriesResponseData { categories: ServiceCategory[]; }
