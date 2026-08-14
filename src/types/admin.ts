export type AdminRole = "super_admin" | "admin";

export interface Admin {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: AdminRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminLoginInput {
    email: string;
    password: string;
}

export interface AdminSessionUser {
    id: number;
    name: string;
    email: string;
    role: AdminRole;
}

export interface AdminLoginResult {
    token: string;
    user: AdminSessionUser;
}

export interface AdminJwtPayload {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: AdminRole;
}

export interface UpdateAdminProfileInput {
    firstName: string;
    lastName: string;
    email: string;
}

export interface ChangeAdminPasswordInput {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface CreateAdminInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface UpdateAdminInput {
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
}

export interface UpdateAdminStatusInput {
    isActive: boolean;
}

export interface ResetAdminPasswordInput {
    newPassword: string;
    confirmPassword: string;
}

export interface AdminProfileResponseData {
    user: Admin;
}

export interface AdminResponseData {
    admin: Admin;
}

export interface SuperAdminDashboardResponseData {
    user: AdminJwtPayload;
}
