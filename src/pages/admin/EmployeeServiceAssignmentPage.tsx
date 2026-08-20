import { UserRoundCheck } from "lucide-react";
import { useState } from "react";
import EmployeeServiceCard from "../../components/admin/employee-services/EmployeeServiceCard";
import EmployeeServiceControls from "../../components/admin/employee-services/EmployeeServiceControls";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useEmployeeServiceAssignments } from "../../hooks/useEmployeeServiceAssignments";
import type { SalonService } from "../../types/service";
import "./employeeServiceAssignmentPage.css";

const EmployeeServiceAssignmentPage = () => {
  const {
    employees,
    services,
    assigned,
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
  } = useEmployeeServiceAssignments();
  const [serviceToRemove, setServiceToRemove] = useState<SalonService | null>(
    null,
  );

  return (
    <div className="assignment-page">
      <header>
        <p className="dashboard-eyebrow">Team capabilities</p>
        <h1>Employee services</h1>
        <p>Choose which salon services each employee can provide.</p>
      </header>
      <EmployeeServiceControls
        employees={employees}
        employeeId={employeeId}
        query={query}
        touched={touched}
        onEmployeeChange={(value) => void selectEmployee(value)}
        onEmployeeBlur={() => setTouched(true)}
        onQueryChange={setQuery}
      />
      {error && <p className="assignment-message is-error">{error}</p>}
      {success && <p className="assignment-message is-success">{success}</p>}
      {!employeeId ? (
        <section className="assignment-empty">
          <UserRoundCheck />
          <h2>Select an employee</h2>
          <p>Choose an employee to view and manage their assigned services.</p>
        </section>
      ) : (
        <section className="assignment-content">
          <header>
            <div>
              <h2>
                {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </h2>
              <p>
                {loading
                  ? "Loading assignments..."
                  : `${assigned.length} of ${services.length} services assigned`}
              </p>
            </div>
          </header>
          <div className="assignment-grid">
            {visibleServices.map((service) => (
              <EmployeeServiceCard
                key={service.id}
                service={service}
                assigned={assignedIds.has(service.id)}
                busy={busyServiceId === service.id || loading}
                onAssign={(item) => void assign(item)}
                onRemove={setServiceToRemove}
              />
            ))}
          </div>
          {visibleServices.length === 0 && (
            <p className="assignment-no-results">No services found.</p>
          )}
        </section>
      )}
      <ConfirmDialog
        open={Boolean(serviceToRemove)}
        title="Remove assigned service?"
        message={`${serviceToRemove?.name ?? "This service"} will be removed from ${selectedEmployee?.firstName ?? "this employee"}.`}
        confirmLabel="Remove service"
        busy={Boolean(serviceToRemove && busyServiceId === serviceToRemove.id)}
        onCancel={() => setServiceToRemove(null)}
        onConfirm={() => {
          if (serviceToRemove)
            void remove(serviceToRemove).then((removed) => {
              if (removed) setServiceToRemove(null);
            });
        }}
      />
    </div>
  );
};

export default EmployeeServiceAssignmentPage;
