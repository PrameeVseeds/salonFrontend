import { Search } from "lucide-react";
import type { Employee } from "../../../types/employee";
import RequiredFieldLabel from "../../common/RequiredFieldLabel";

interface EmployeeServiceControlsProps {
  employees: Employee[];
  employeeId: string;
  query: string;
  touched: boolean;
  onEmployeeChange: (employeeId: string) => void;
  onEmployeeBlur: () => void;
  onQueryChange: (query: string) => void;
}

const EmployeeServiceControls = ({employees, employeeId, query, touched,
  onEmployeeChange,
  onEmployeeBlur,
  onQueryChange,
}: EmployeeServiceControlsProps) => (
  <section className="assignment-controls">
    <label>
      <RequiredFieldLabel>Employee</RequiredFieldLabel>
      <select
        value={employeeId}
        onChange={(event) => onEmployeeChange(event.target.value)}
        onBlur={onEmployeeBlur}
        aria-invalid={touched && !employeeId}
      >
        <option value="">Select an employee</option>
        {employees.map((employee) => (
          <option value={employee.id} key={employee.id}>
            {employee.firstName} {employee.lastName}
            {employee.isActive ? "" : " (Inactive)"}
          </option>
        ))}
      </select>
      {touched && !employeeId && <small>Employee is required.</small>}
    </label>
    <label className="assignment-search">
      <Search />
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search services"
        aria-label="Search services"
      />
    </label>
  </section>
);

export default EmployeeServiceControls;
