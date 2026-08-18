export interface Employee {
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

export interface SaveEmployeeInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface EmployeeResponseData {
  employee: Employee;
}
export interface EmployeesResponseData {
  employees: Employee[];
}
export interface EmployeeImageResponseData {
  profileImage: string;
}
