import { ChevronDown } from "lucide-react";
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
  } = useEmployeeServiceAssignments();
  const [serviceToRemove, setServiceToRemove] = useState<SalonService | null>(
    null,
  );
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);

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
      <section className={`assignment-overview${isOverviewExpanded ? " is-expanded" : ""}`}>
        <button
          type="button"
          className="assignment-overview_header"
          aria-expanded={isOverviewExpanded}
          aria-controls="service-assignment-overview-list"
          onClick={() => setIsOverviewExpanded((expanded) => !expanded)}
        >
          <div>
            <h2>Services and assigned employees</h2>
            <p>See which employees are assigned to each service.</p>
          </div>
          <span className="assignment-overview_header-meta">
            {services.length} services
            <ChevronDown aria-hidden="true" />
          </span>
        </button>
        {isOverviewExpanded && (services.length ? (
          <div className="assignment-overview_list" id="service-assignment-overview-list">
            {visibleServices.map((service) => {
              const assignedEmployees = assignedEmployeesByService[service.id] ?? [];
              const isExpanded = expandedServiceId === service.id;
              return (
                <article className={isExpanded ? "is-expanded" : ""} key={service.id}>
                  <button
                    type="button"
                    className="assignment-overview_trigger"
                    aria-expanded={isExpanded}
                    aria-controls={`service-assignees-${service.id}`}
                    onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                  >
                    <span className="assignment-overview_service">
                      <strong>{service.name}</strong>
                      <small>{service.durationMinutes} min · Rs. {Number(service.price).toFixed(2)}</small>
                    </span>
                    <span className="assignment-overview_summary">
                      {assignedEmployees.length
                        ? assignedEmployees.length + " employee" + (assignedEmployees.length === 1 ? "" : "s")
                        : "No employees assigned"}
                      <ChevronDown aria-hidden="true" />
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="assignment-overview_employees" id={`service-assignees-${service.id}`}>
                      {assignedEmployees.length ? assignedEmployees.map((employee) => (
                        <span key={employee.id}>
                          {employee.firstName} {employee.lastName}{employee.isActive ? "" : " · Inactive"}
                        </span>
                      )) : <small>No employees assigned to this service.</small>}
                    </div>
                  )}
                </article>
              );
            })}
            {!visibleServices.length && <p className="assignment-no-results">No services found.</p>}
          </div>
        ) : (
          <p className="assignment-overview_loading" id="service-assignment-overview-list">{error ?? "Loading services and assignments..."}</p>
        ))}
      </section>
      {error && <p className="assignment-message is-error">{error}</p>}
      {success && <p className="assignment-message is-success">{success}</p>}
      {!employeeId ? (
        <p className="assignment-selection-hint">
          Select an employee above to add or remove their service assignments.
        </p>
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
