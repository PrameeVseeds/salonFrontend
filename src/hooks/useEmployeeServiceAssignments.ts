import { useEffect, useMemo, useState } from "react";
import { getEmployees } from "../services/employeeService";
import {assignServiceToEmployee,getAssignedEmployeeServices,
  removeServiceFromEmployee,} from "../services/employeeServiceAssignmentService";
import { getServices } from "../services/salonService";
import type { Employee } from "../types/employee";
import type { SalonService } from "../types/service";
import { getApiErrorMessage } from "../utils/apiError";

export const useEmployeeServiceAssignments = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<SalonService[]>([]);
  const [assigned, setAssigned] = useState<SalonService[]>([]);
  const [assignedEmployeesByService, setAssignedEmployeesByService] = useState<Record<number, Employee[]>>({});
  const [employeeId, setEmployeeId] = useState("");
  const [query, setQuery] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyServiceId, setBusyServiceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getEmployees(), getServices()])
      .then(([employeeResponse, serviceResponse]) => {
        const loadedEmployees = employeeResponse.data.employees;
        setEmployees(loadedEmployees);
        setServices(serviceResponse.data.services);
        void Promise.allSettled(loadedEmployees.map(async (employee) => ({
          employee,
          services: (await getAssignedEmployeeServices(employee.id)).data.services,
        }))).then((results) => {
          const assignments: Record<number, Employee[]> = {};
          results.forEach((result) => {
            if (result.status !== "fulfilled") return;
            result.value.services.forEach((service) => {
              assignments[service.id] = [...(assignments[service.id] ?? []), result.value.employee];
            });
          });
          setAssignedEmployeesByService(assignments);
          if (results.some((result) => result.status === "rejected"))
            setError("Some employee service assignments could not be loaded.");
        });
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError)));
  }, []);

  const selectEmployee = async (value: string) => {
    setEmployeeId(value);
    setTouched(true);
    setAssigned([]);
    setError(null);
    setSuccess(null);
    if (!value) return;
    setLoading(true);
    try {
      const { data } = await getAssignedEmployeeServices(Number(value));
      setAssigned(data.services);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const assign = async (service: SalonService) => {
    if (!employeeId) {
      setTouched(true);
      return;
    }
    setBusyServiceId(service.id);
    setError(null);
    setSuccess(null);
    try {
      await assignServiceToEmployee(Number(employeeId), service.id);
      setAssigned((current) => [...current, service]);
      if (selectedEmployee)
        setAssignedEmployeesByService((current) => ({
          ...current,
          [service.id]: [...(current[service.id] ?? []), selectedEmployee],
        }));
      setSuccess(`${service.name} assigned successfully.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyServiceId(null);
    }
  };

  const remove = async (service: SalonService) => {
    if (!employeeId) return false;
    setBusyServiceId(service.id);
    setError(null);
    setSuccess(null);
    try {
      await removeServiceFromEmployee(Number(employeeId), service.id);
      setAssigned((current) =>
        current.filter((item) => item.id !== service.id),
      );
      setAssignedEmployeesByService((current) => ({
        ...current,
        [service.id]: (current[service.id] ?? []).filter((employee) => employee.id !== Number(employeeId)),
      }));
      setSuccess(`${service.name} removed successfully.`);
      return true;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      return false;
    } finally {
      setBusyServiceId(null);
    }
  };

  const assignedIds = useMemo(
    () => new Set(assigned.map((service) => service.id)),
    [assigned],
  );
  const visibleServices = useMemo(
    () =>
      services.filter((service) =>
        `${service.name} ${service.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [query, services],
  );
  const selectedEmployee = employees.find(
    (employee) => employee.id === Number(employeeId),
  );

  return {
    employees,
    services,
    assigned,
    assignedEmployeesByService,
    assignedIds,
    visibleServices,
    employeeId,
    query,
    touched,
    loading,
    busyServiceId,
    error,
    success,
    selectedEmployee,
    setQuery,
    setTouched,
    selectEmployee,
    assign,
    remove,
  };
};
