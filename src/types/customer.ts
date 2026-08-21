export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  profileImage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterCustomerInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CustomerLoginInput {
  email: string;
  password: string;
}

export interface UpdateCustomerProfileInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface CustomerJwtPayload {
  id: number;
  email: string;
  accountType: "customer";
}

export interface CustomerSessionUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  isActive: boolean;
}

export interface CustomerLoginResult {
  token: string;
  user: CustomerSessionUser;
}

export interface ChangeCustomerPasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotCustomerPasswordInput {
  email: string;
}

export interface ResetCustomerPasswordInput {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateCustomerProfileImageResult {
  profileImage: string;
}

export interface CustomerResponseData {
  customer: Customer;
}

export interface CustomersResponseData {
  customers: Customer[];
}
