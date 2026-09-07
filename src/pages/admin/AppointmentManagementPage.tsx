import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Play,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  assignAppointmentEmployee,
  cancelAppointment,
  completeAppointment,
  createAdminAppointment,
  getAppointments,
  getAvailableAdminAppointmentSlots,
  getAvailableAppointmentEmployees,
  startAppointment,
} from "../../services/appointmentService";
import { getEmployees } from "../../services/employeeService";
import { getAssignedEmployeeServices } from "../../services/employeeServiceAssignmentService";
import { getServices } from "../../services/salonService";
import type {
  Appointment,
  AppointmentStatus,
  CreateAdminAppointmentInput,
} from "../../types/appointment";
import type { Employee } from "../../types/employee";
import type { SalonService } from "../../types/service";
import { getApiErrorMessage } from "../../utils/apiError";
import "./appointmentManagementPage.css";

type StatusFilter = AppointmentStatus | "Active" | "";
const statuses: StatusFilter[] = [
  "Active",
  "",
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
];
const APPOINTMENT_GROUPS_PER_PAGE = 10;
const bookingDateBounds = (() => {
  const format = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const today = new Date();
  const latest = new Date(today);
  latest.setDate(latest.getDate() + 3);
  return { min: format(today), max: format(latest) };
})();
const emptyAdminBooking = {
  customerName: "",
  customerPhone: "",
  serviceId: "",
  employeeId: "",
  appointmentDate: "",
  startTime: "",
  notes: "",
};

const toApiDate = (value: string): string | undefined => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, year, month, day] = match;
  const candidate = new Date(`${year}-${month}-${day}T00:00:00Z`);
  if (
    candidate.getUTCFullYear() !== Number(year) ||
    candidate.getUTCMonth() + 1 !== Number(month) ||
    candidate.getUTCDate() !== Number(day)
  )
    return undefined;
  return `${year}-${month}-${day}`;
};

const AppointmentManagementPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<SalonService[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Active");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [eligibleEmployees, setEligibleEmployees] = useState<
    Record<number, Employee[]>
  >({});
  const [availableEmployeeIds, setAvailableEmployeeIds] = useState<
    Record<string, number[]>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [adminBookingOpen, setAdminBookingOpen] = useState(false);
  const [adminBooking, setAdminBooking] = useState(emptyAdminBooking);
  const [adminBookingError, setAdminBookingError] = useState<string | null>(
    null,
  );
  const [adminBookingBusy, setAdminBookingBusy] = useState(false);
  const [adminAvailableSlots, setAdminAvailableSlots] = useState<string[]>([]);
  const [adminSlotsLoading, setAdminSlotsLoading] = useState(false);
  const [adminSlotsMessage, setAdminSlotsMessage] = useState<string | null>(
    null,
  );
  const dateInputRef = useRef<HTMLInputElement>(null);
  const adminDateInputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.focus();
      input.click();
    }
  };

  const openAdminDatePicker = () => {
    const input = adminDateInputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.focus();
      input.click();
    }
  };

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const filters = {
          date: toApiDate(date),
          search: appliedSearch || undefined,
        };
        if (status === "Active") {
          const [scheduledResponse, inProgressResponse] = await Promise.all([
            getAppointments({ ...filters, status: "Scheduled" }),
            getAppointments({ ...filters, status: "In Progress" }),
          ]);
          setAppointments([
            ...scheduledResponse.data.appointments,
            ...inProgressResponse.data.appointments,
          ]);
        } else {
          const { data } = await getAppointments({
            ...filters,
            status: status || undefined,
          });
          setAppointments(data.appointments);
        }
      } catch (requestError) {
        setError(
          getApiErrorMessage(requestError, "Unable to load appointments."),
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [date, status, appliedSearch],
  );

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => void load(), 0);
    const refreshTimer = window.setInterval(() => void load(true), 30_000);
    return () => {
      window.clearTimeout(initialLoadTimer);
      window.clearInterval(refreshTimer);
    };
  }, [load]);

  useEffect(() => {
    const clockTimer = window.setInterval(
      () => setCurrentTime(Date.now()),
      30_000,
    );
    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    getEmployees()
      .then(async ({ data }) => {
        const activeEmployees = data.employees.filter(
          (employee) => employee.isActive,
        );
        setEmployees(activeEmployees);
        const assignments = await Promise.all(
          activeEmployees.map(async (employee) => ({
            employee,
            services: (await getAssignedEmployeeServices(employee.id)).data
              .services,
          })),
        );
        const byService: Record<number, Employee[]> = {};
        assignments.forEach(({ employee, services }) =>
          services.forEach((service) => {
            (byService[service.id] ??= []).push(employee);
          }),
        );
        setEligibleEmployees(byService);
      })
      .catch(() => setEligibleEmployees({}));
  }, []);

  useEffect(() => {
    getServices()
      .then(({ data }) =>
        setServices(
          data.services.filter(
            (service) => service.isActive && service.categoryIsActive,
          ),
        ),
      )
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    let active = true;
    const scheduled = appointments.filter(
      (appointment) => appointment.status === "Scheduled",
    );
    Promise.all(
      scheduled.flatMap((appointment) => {
        const serviceIds =
          appointment.services && appointment.services.length > 1
            ? appointment.services.map((service) => service.serviceId)
            : [undefined];
        return serviceIds.map(async (serviceId) => ({
          key: `${appointment.id}:${serviceId ?? "all"}`,
          employeeIds: (
            await getAvailableAppointmentEmployees(appointment.id, serviceId)
          ).data.employeeIds,
        }));
      }),
    )
      .then((results) => {
        if (active)
          setAvailableEmployeeIds(
            Object.fromEntries(
              results.map((result) => [result.key, result.employeeIds]),
            ),
          );
      })
      .catch(() => {
        if (active) setAvailableEmployeeIds({});
      });
    return () => {
      active = false;
    };
  }, [appointments]);

  const availableEmployeesFor = (
    appointment: Appointment,
    serviceId = appointment.serviceId,
  ) => {
    const key = `${appointment.id}:${appointment.services && appointment.services.length > 1 ? serviceId : "all"}`;
    const ids = availableEmployeeIds[key] ?? [];
    return (eligibleEmployees[serviceId] ?? []).filter((employee) =>
      ids.includes(employee.id),
    );
  };

  const canStart = (appointment: Appointment) => {
    const startsAt = new Date(
      `${appointment.appointmentDate}T${appointment.startTime}`,
    ).getTime();
    const endsAt = new Date(
      `${appointment.appointmentDate}T${appointment.endTime}`,
    ).getTime();
    return currentTime >= startsAt && currentTime <= endsAt;
  };

  const counts = useMemo(
    () => ({
      total: appointments.length,
      scheduled: appointments.filter((item) => item.status === "Scheduled")
        .length,
      active: appointments.filter((item) => item.status === "In Progress")
        .length,
      completed: appointments.filter((item) => item.status === "Completed")
        .length,
    }),
    [appointments],
  );
  const orderedAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const appointmentTime = (appointment: Appointment) =>
      new Date(
        `${appointment.appointmentDate}T${appointment.startTime}`,
      ).getTime();
    return [...appointments].sort((first, second) => {
      const firstTime = appointmentTime(first);
      const secondTime = appointmentTime(second);
      const distance =
        Math.abs(firstTime - today) - Math.abs(secondTime - today);
      return distance || firstTime - secondTime;
    });
  }, [appointments]);

  const appointmentGroups = useMemo(() => {
    const groups: Appointment[][] = [];
    orderedAppointments.forEach((appointment) => {
      const group = groups.find((candidate) => {
        const first = candidate[0]!;
        return (
          first.customerId === appointment.customerId &&
          first.appointmentDate === appointment.appointmentDate &&
          first.status === appointment.status &&
          Math.abs(
            new Date(first.createdAt).getTime() -
              new Date(appointment.createdAt).getTime(),
          ) <=
            5 * 60_000
        );
      });
      if (group) group.push(appointment);
      else groups.push([appointment]);
    });
    return groups;
  }, [orderedAppointments]);
  const appointmentGroupInfo = useMemo(() => {
    const info = new Map<
      number,
      { count: number; position: number; appointments: Appointment[] }
    >();
    appointmentGroups.forEach((group) => {
      if (group.length < 2) return;
      group.forEach((appointment, index) =>
        info.set(appointment.id, {
          count: group.length,
          position: index + 1,
          appointments: group,
        }),
      );
    });
    return info;
  }, [appointmentGroups]);
  const totalPages = Math.max(
    1,
    Math.ceil(appointmentGroups.length / APPOINTMENT_GROUPS_PER_PAGE),
  );
  const paginatedAppointmentGroups = useMemo(() => {
    const start = (currentPage - 1) * APPOINTMENT_GROUPS_PER_PAGE;
    return appointmentGroups.slice(start, start + APPOINTMENT_GROUPS_PER_PAGE);
  }, [appointmentGroups, currentPage]);

  useEffect(() => setCurrentPage(1), [date, status, appliedSearch]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const replaceAppointment = (updated: Appointment) => {
    setAppointments((current) =>
      current.map((item) =>
        item.id === updated.id ? { ...item, ...updated } : item,
      ),
    );
    setSelected((current) =>
      current?.id === updated.id ? { ...current, ...updated } : current,
    );
  };

  const changeStatus = async (appointment: Appointment) => {
    setBusyId(appointment.id);
    setError(null);
    setSuccess(null);
    try {
      const response =
        appointment.status === "Scheduled"
          ? await startAppointment(appointment.id)
          : await completeAppointment(appointment.id);
      replaceAppointment(response.data.appointment);
      setSuccess(response.message);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to update appointment."),
      );
    } finally {
      setBusyId(null);
    }
  };

  const submitCancellation = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;

    setBusyId(cancelTarget.id);
    setError(null);
    try {
      const response = await cancelAppointment(
        cancelTarget.id,
        cancelReason.trim(),
      );
      replaceAppointment(response.data.appointment);
      setCancelTarget(null);
      setCancelReason("");
      setSuccess(response.message);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to cancel appointment."),
      );
    } finally {
      setBusyId(null);
    }
  };

  const assignEmployee = async (
    appointment: Appointment,
    employeeId: number,
    serviceId?: number,
  ) => {
    setBusyId(appointment.id);
    setError(null);
    setSuccess(null);
    try {
      const response = await assignAppointmentEmployee(
        appointment.id,
        employeeId,
        serviceId,
      );
      replaceAppointment(response.data.appointment);
      setSuccess(response.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to assign employee."));
    } finally {
      setBusyId(null);
    }
  };

  const openAdminBooking = () => {
    setAdminBooking(emptyAdminBooking);
    setAdminBookingError(null);
    setAdminAvailableSlots([]);
    setAdminSlotsMessage(null);
    setAdminBookingOpen(true);
  };

  const loadAdminAvailableSlots = async (nextBooking: typeof adminBooking) => {
    setAdminAvailableSlots([]);
    setAdminSlotsMessage(null);
    if (!nextBooking.serviceId || !nextBooking.appointmentDate) return;
    setAdminSlotsLoading(true);
    try {
      const slots = await getAvailableAdminAppointmentSlots(
        Number(nextBooking.serviceId),
        nextBooking.employeeId ? Number(nextBooking.employeeId) : null,
        nextBooking.appointmentDate,
      );
      setAdminAvailableSlots(slots);
      if (!slots.length)
        setAdminSlotsMessage("No time slots are available for this date.");
    } catch (requestError) {
      setAdminSlotsMessage(
        getApiErrorMessage(
          requestError,
          "Unable to load available time slots.",
        ),
      );
    } finally {
      setAdminSlotsLoading(false);
    }
  };

  const submitAdminBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !adminBooking.customerName.trim() ||
      !adminBooking.serviceId ||
      !adminBooking.appointmentDate ||
      !adminBooking.startTime
    ) {
      setAdminBookingError(
        "Customer name, service, date, and time are required.",
      );
      return;
    }
    setAdminBookingBusy(true);
    setAdminBookingError(null);
    try {
      const input: CreateAdminAppointmentInput = {
        customerId: null,
        customerName: adminBooking.customerName.trim(),
        customerPhone: adminBooking.customerPhone.trim() || null,
        serviceId: Number(adminBooking.serviceId),
        employeeId: adminBooking.employeeId
          ? Number(adminBooking.employeeId)
          : null,
        appointmentDate: adminBooking.appointmentDate,
        startTime: adminBooking.startTime,
        notes: adminBooking.notes.trim() || null,
        notifyCustomer: false,
      };
      const { data, message } = await createAdminAppointment(input);
      setAppointments((current) => [
        ...current,
        { ...data.appointment, isAdminCreated: true },
      ]);
      setAdminBookingOpen(false);
      setSuccess(
        message ||
          "Admin appointment created. No customer notification was sent.",
      );
    } catch (requestError) {
      setAdminBookingError(
        getApiErrorMessage(
          requestError,
          "Unable to create the admin appointment.",
        ),
      );
    } finally {
      setAdminBookingBusy(false);
    }
  };

  return (
    <div className="appointment-page">
      <header className="appointment-heading">
        <div>
          <p className="dashboard-eyebrow">Daily operations</p>
          <h1>Appointments</h1>
          <p>Track arrivals, services, completions, and cancellations.</p>
        </div>
        <div className="appointment-heading-actions">
          <button
            className="appointment-create"
            type="button"
            onClick={openAdminBooking}
          >
            <Plus /> Add appointment
          </button>
          <button
            className="appointment-refresh"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw />
            Refresh
          </button>
        </div>
      </header>
      {error && <p className="appointment-message is-error">{error}</p>}
      {success && <p className="appointment-message is-success">{success}</p>}

      <section className="appointment-summary" aria-label="Appointment summary">
        <article>
          <CalendarDays />
          <div>
            <strong>{counts.total}</strong>
            <span>Results</span>
          </div>
        </article>
        <article>
          <Clock3 />
          <div>
            <strong>{counts.scheduled}</strong>
            <span>Scheduled</span>
          </div>
        </article>
        <article>
          <Play />
          <div>
            <strong>{counts.active}</strong>
            <span>In progress</span>
          </div>
        </article>
        <article>
          <CheckCircle2 />
          <div>
            <strong>{counts.completed}</strong>
            <span>Completed</span>
          </div>
        </article>
      </section>

      <section className="appointment-card">
        <form
          className="appointment-filters"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedSearch(search.trim());
          }}
        >
          <label>
            <span>Search customer</span>
            <div>
              <Search />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, phone, or email"
              />
            </div>
          </label>
          <label>
            <span>Date</span>
            <div
              className="appointment-date-picker"
              role="button"
              tabIndex={0}
              aria-label="Select appointment date"
              onClick={openDatePicker}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDatePicker();
                }
              }}
            >
              <span className={date ? "" : "is-placeholder"}>
                {date ? date.split("-").reverse().join("-") : "dd-mm-yyyy"}
              </span>
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
          </label>
          <label>
            <span>Status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
            >
              {statuses.map((item) => (
                <option key={item || "all"} value={item}>
                  {item === "Active"
                    ? "Scheduled & In Progress"
                    : item || "All statuses"}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Apply</button>
          <button
            type="button"
            className="is-secondary"
            onClick={() => {
              setSearch("");
              setAppliedSearch("");
              setDate("");
              setStatus("Active");
            }}
          >
            Clear
          </button>
        </form>
        <div className="appointment-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date & time</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Employee</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointmentGroups.flat().map((appointment) => (
                <tr
                  key={appointment.id}
                  className={
                    appointmentGroupInfo.has(appointment.id)
                      ? `is-group-booking is-group-${
                          appointmentGroupInfo.get(appointment.id)!.position ===
                          1
                            ? "first"
                            : appointmentGroupInfo.get(appointment.id)!
                                  .position ===
                                appointmentGroupInfo.get(appointment.id)!.count
                              ? "last"
                              : "middle"
                        }`
                      : undefined
                  }
                >
                  {(!appointmentGroupInfo.has(appointment.id) ||
                    appointmentGroupInfo.get(appointment.id)!.position ===
                      1) && (
                    <>
                      <td
                        className="appointment-group-shared"
                        rowSpan={
                          appointmentGroupInfo.get(appointment.id)?.count ?? 1
                        }
                        data-label="Date & time"
                      >
                        <strong>{appointment.appointmentDate}</strong>
                        {appointmentGroupInfo.has(appointment.id) ? (
                          <small>
                            {
                              new Set(
                                appointmentGroupInfo
                                  .get(appointment.id)!
                                  .appointments.map((item) => item.startTime),
                              ).size
                            }
                            scheduled times
                          </small>
                        ) : (
                          <small>
                            {appointment.startTime.slice(0, 5)} -{" "}
                            {appointment.endTime.slice(0, 5)}
                          </small>
                        )}
                      </td>
                      <td
                        className="appointment-group-shared"
                        rowSpan={
                          appointmentGroupInfo.get(appointment.id)?.count ?? 1
                        }
                        data-label="Customer"
                      >
                        <strong>
                          {appointment.customerName ??
                            (appointment.customerId
                              ? `Customer #${appointment.customerId}`
                              : "Walk-in customer")}
                        </strong>
                        {(appointment.isAdminCreated ||
                          appointment.customerId === null) && (
                          <small className="appointment-admin-mark">
                            Admin booking
                          </small>
                        )}
                        <small>
                          {appointment.customerPhone ??
                            appointment.customerEmail}
                        </small>
                        {appointmentGroupInfo.has(appointment.id) && (
                          <span className="appointment-group-badge">
                            Group booking ·{" "}
                            {appointmentGroupInfo.get(appointment.id)!.count}{" "}
                            appointments
                          </span>
                        )}
                      </td>
                      <td
                        className="appointment-group-shared"
                        rowSpan={
                          appointmentGroupInfo.get(appointment.id)?.count ?? 1
                        }
                        data-label="Service"
                      >
                        {appointmentGroupInfo.has(appointment.id) ? (
                          <div className="appointment-bulk-services">
                            {appointmentGroupInfo
                              .get(appointment.id)!
                              .appointments.map((item, index) => (
                                <span key={item.id}>
                                  <b>#{index + 1}</b>
                                  <strong>
                                    {item.services?.length
                                      ? item.services
                                          .map((service) => service.serviceName)
                                          .join(" + ")
                                      : (item.serviceName ??
                                        `Service #${item.serviceId}`)}
                                  </strong>
                                  <small>
                                    {item.startTime.slice(0, 5)}–
                                    {item.endTime.slice(0, 5)}
                                  </small>
                                </span>
                              ))}
                          </div>
                        ) : appointment.services?.length ? (
                          appointment.services.map((service) => (
                            <span
                              key={service.serviceId}
                              className="appointment-service-segment"
                            >
                              <strong>{service.serviceName}</strong>
                              <small>
                                {service.startTime.slice(0, 5)}–
                                {service.endTime.slice(0, 5)}
                              </small>
                            </span>
                          ))
                        ) : (
                          <>
                            <strong>
                              {appointment.serviceName ??
                                `Service #${appointment.serviceId}`}
                            </strong>
                            <small>
                              {appointment.serviceDurationMinutes
                                ? `${appointment.serviceDurationMinutes} minutes`
                                : ""}
                            </small>
                          </>
                        )}
                      </td>
                    </>
                  )}
                  <td data-label="Employee">
                    {appointment.services && appointment.services.length > 1 ? (
                      appointment.services.map((service) => (
                        <span
                          key={service.serviceId}
                          className="appointment-service-segment"
                        >
                          <small>{service.serviceName}</small>
                          {appointment.status === "Scheduled" ? (
                            <select
                              className={`appointment-employee-select${service.employeeId ? "" : " is-unassigned"}`}
                              aria-label={`Assign employee for ${service.serviceName}`}
                              value={
                                availableEmployeesFor(
                                  appointment,
                                  service.serviceId,
                                ).some(
                                  (employee) =>
                                    employee.id === service.employeeId,
                                )
                                  ? (service.employeeId ?? "")
                                  : ""
                              }
                              disabled={
                                busyId === appointment.id ||
                                !availableEmployeesFor(
                                  appointment,
                                  service.serviceId,
                                ).length
                              }
                              onChange={(event) => {
                                const employeeId = Number(event.target.value);
                                if (
                                  employeeId &&
                                  employeeId !== service.employeeId
                                )
                                  void assignEmployee(
                                    appointment,
                                    employeeId,
                                    service.serviceId,
                                  );
                              }}
                            >
                              <option value="">
                                {availableEmployeesFor(
                                  appointment,
                                  service.serviceId,
                                ).length
                                  ? "Assign employee"
                                  : "No available employees"}
                              </option>
                              {availableEmployeesFor(
                                appointment,
                                service.serviceId,
                              ).map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                  {employee.firstName} {employee.lastName}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <strong>
                              {service.employeeName ?? "Unassigned"}
                            </strong>
                          )}
                        </span>
                      ))
                    ) : appointment.status === "Scheduled" ? (
                      <select
                        className={`appointment-employee-select${appointment.employeeId ? "" : " is-unassigned"}`}
                        aria-label={`Assign employee to appointment ${appointment.id}`}
                        title="Assign or change employee"
                        value={
                          availableEmployeesFor(appointment).some(
                            (employee) =>
                              employee.id === appointment.employeeId,
                          )
                            ? (appointment.employeeId ?? "")
                            : ""
                        }
                        disabled={
                          busyId === appointment.id ||
                          !availableEmployeesFor(appointment).length
                        }
                        onChange={(event) => {
                          const employeeId = Number(event.target.value);
                          if (
                            employeeId &&
                            employeeId !== appointment.employeeId
                          )
                            void assignEmployee(appointment, employeeId);
                        }}
                      >
                        <option value="">
                          {availableEmployeesFor(appointment).length
                            ? "Assign employee"
                            : "No available employees"}
                        </option>
                        {availableEmployeesFor(appointment).map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      (appointment.employeeName ??
                      (appointment.employeeId
                        ? `Employee #${appointment.employeeId}`
                        : "Unassigned"))
                    )}
                  </td>
                  <td data-label="Amount">
                    {Number(appointment.totalAmount).toFixed(2)}
                  </td>
                  <td data-label="Status">
                    <span
                      className={`appointment-status is-${appointment.status.toLowerCase().replace(" ", "-")}`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="appointment-actions">
                      <button
                        className="is-view"
                        title="View details"
                        onClick={() => setSelected(appointment)}
                      >
                        <Eye />
                      </button>
                      {(appointment.status === "Scheduled" ||
                        appointment.status === "In Progress") && (
                        <button
                          disabled={
                            busyId === appointment.id ||
                            (appointment.status === "Scheduled" &&
                              !canStart(appointment))
                          }
                          title={
                            appointment.status === "Scheduled" &&
                            !canStart(appointment)
                              ? "This appointment can only be started during its scheduled time."
                              : undefined
                          }
                          onClick={() => void changeStatus(appointment)}
                        >
                          {appointment.status === "Scheduled" ? (
                            <Play />
                          ) : (
                            <CheckCircle2 />
                          )}
                          {appointment.status === "Scheduled"
                            ? "Start"
                            : "Complete"}
                        </button>
                      )}
                      {(appointment.status === "Scheduled" ||
                        appointment.status === "In Progress") && (
                        <button
                          className="is-cancel"
                          title="Cancel appointment"
                          onClick={() => setCancelTarget(appointment)}
                        >
                          <Ban />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !appointments.length && (
                <tr>
                  <td className="appointment-empty" colSpan={7}>
                    <Clock3 />
                    No appointments match these filters.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="appointment-empty" colSpan={7}>
                    Loading appointments...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && appointmentGroups.length > 0 && (
          <nav className="admin-pagination" aria-label="Appointment pages">
            <span>
              Showing {(currentPage - 1) * APPOINTMENT_GROUPS_PER_PAGE + 1}–
              {Math.min(
                currentPage * APPOINTMENT_GROUPS_PER_PAGE,
                appointmentGroups.length,
              )}{" "}
              of {appointmentGroups.length} booking groups
            </span>
            <div>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft /> Previous
              </button>
              <strong>
                Page {currentPage} of {totalPages}
              </strong>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight />
              </button>
            </div>
          </nav>
        )}
      </section>

      {adminBookingOpen && (
        <div
          className="appointment-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setAdminBookingOpen(false);
          }}
        >
          <section
            className="appointment-modal appointment-admin-booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-booking-title"
          >
            <header>
              <div>
                <p>Walk-in or phone booking</p>
                <h2 id="admin-booking-title">Add appointment</h2>
              </div>
              <button
                type="button"
                onClick={() => setAdminBookingOpen(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </header>
            <p className="appointment-admin-booking-note">
              This booking is marked as an admin booking. It has no customer
              account and no email notification is sent.
            </p>
            <form
              className="appointment-admin-booking-form"
              onSubmit={(event) => void submitAdminBooking(event)}
            >
              <label>
                <span>Customer name</span>
                <input
                  autoFocus
                  value={adminBooking.customerName}
                  onChange={(event) =>
                    setAdminBooking((current) => ({
                      ...current,
                      customerName: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                <span>
                  Phone number <small>(optional)</small>
                </span>
                <input
                  type="tel"
                  value={adminBooking.customerPhone}
                  onChange={(event) =>
                    setAdminBooking((current) => ({
                      ...current,
                      customerPhone: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Service</span>
                <select
                  value={adminBooking.serviceId}
                  onChange={(event) => {
                    const next = {
                      ...adminBooking,
                      serviceId: event.target.value,
                      employeeId: "",
                      startTime: "",
                    };
                    setAdminBooking(next);
                    void loadAdminAvailableSlots(next);
                  }}
                  required
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.durationMinutes} min)
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  Employee <small>(optional)</small>
                </span>
                <select
                  value={adminBooking.employeeId}
                  onChange={(event) => {
                    const next = {
                      ...adminBooking,
                      employeeId: event.target.value,
                      startTime: "",
                    };
                    setAdminBooking(next);
                    void loadAdminAvailableSlots(next);
                  }}
                >
                  <option value="">Assign later</option>
                  {employees
                    .filter(
                      (employee) =>
                        !adminBooking.serviceId ||
                        (
                          eligibleEmployees[Number(adminBooking.serviceId)] ??
                          []
                        ).some((eligible) => eligible.id === employee.id),
                    )
                    .map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span>Date</span>
                <div
                  className="appointment-date-picker appointment-admin-date-picker"
                  role="button"
                  tabIndex={0}
                  aria-label="Select appointment date"
                  onClick={openAdminDatePicker}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openAdminDatePicker();
                    }
                  }}
                >
                  <span
                    className={
                      adminBooking.appointmentDate ? "" : "is-placeholder"
                    }
                  >
                    {adminBooking.appointmentDate
                      ? adminBooking.appointmentDate
                          .split("-")
                          .reverse()
                          .join("-")
                      : "dd-mm-yyyy"}
                  </span>
                  <input
                    ref={adminDateInputRef}
                    type="date"
                    min={bookingDateBounds.min}
                    max={bookingDateBounds.max}
                    value={adminBooking.appointmentDate}
                    onChange={(event) => {
                      const next = {
                        ...adminBooking,
                        appointmentDate: event.target.value,
                        startTime: "",
                      };
                      setAdminBooking(next);
                      void loadAdminAvailableSlots(next);
                    }}
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
              </label>
              <label>
                <span>Start time</span>
                <select
                  value={adminBooking.startTime}
                  onChange={(event) =>
                    setAdminBooking((current) => ({
                      ...current,
                      startTime: event.target.value,
                    }))
                  }
                  disabled={
                    !adminBooking.serviceId ||
                    !adminBooking.appointmentDate ||
                    adminSlotsLoading ||
                    !adminAvailableSlots.length
                  }
                  required
                >
                  <option value="">
                    {adminSlotsLoading
                      ? "Loading available times..."
                      : !adminBooking.serviceId || !adminBooking.appointmentDate
                        ? "Select service and date first"
                        : adminAvailableSlots.length
                          ? "Select a time"
                          : "No times available"}
                  </option>
                  {adminAvailableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot.slice(0, 5)}
                    </option>
                  ))}
                </select>
              </label>
              {adminSlotsMessage && (
                <p className="appointment-slot-message is-wide" role="status">
                  {adminSlotsMessage}
                </p>
              )}
              <label className="is-wide">
                <span>
                  Notes <small>(optional)</small>
                </span>
                <textarea
                  value={adminBooking.notes}
                  onChange={(event) =>
                    setAdminBooking((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Booking details"
                />
              </label>
              {adminBookingError && (
                <p className="appointment-message is-error is-wide">
                  {adminBookingError}
                </p>
              )}
              <footer className="is-wide">
                <button
                  type="button"
                  className="is-secondary"
                  onClick={() => setAdminBookingOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={adminBookingBusy}>
                  {adminBookingBusy
                    ? "Creating..."
                    : "Create admin appointment"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          className="appointment-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            className="appointment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-details-title"
          >
            <header>
              <div>
                <p>Appointment #{selected.id}</p>
                <h2 id="appointment-details-title">Appointment details</h2>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close">
                <X />
              </button>
            </header>
            <dl>
              <div>
                <dt>Customer</dt>
                <dd>
                  {selected.customerName ??
                    (selected.customerId
                      ? `#${selected.customerId}`
                      : "Walk-in customer")}
                  {(selected.isAdminCreated ||
                    selected.customerId === null) && (
                    <small className="appointment-admin-mark">
                      Admin booking
                    </small>
                  )}
                  {(selected.customerPhone || selected.customerEmail) && (
                    <small>
                      {selected.customerPhone}
                      {selected.customerPhone && selected.customerEmail && (
                        <br />
                      )}
                      {selected.customerEmail}
                    </small>
                  )}
                </dd>
              </div>
              <div>
                <dt>Service</dt>
                <dd>{selected.serviceName ?? `#${selected.serviceId}`}</dd>
              </div>
              <div>
                <dt>Employee</dt>
                <dd>{selected.employeeName ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt>Schedule</dt>
                <dd>
                  {selected.appointmentDate}, {selected.startTime.slice(0, 5)} -{" "}
                  {selected.endTime.slice(0, 5)}
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span
                    className={`appointment-status is-${selected.status.toLowerCase().replace(" ", "-")}`}
                  >
                    {selected.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{Number(selected.totalAmount).toFixed(2)}</dd>
              </div>
              <div className="is-wide">
                <dt>Customer notes</dt>
                <dd>{selected.notes || "No notes provided."}</dd>
              </div>
              {selected.cancellationReason && (
                <div className="is-wide">
                  <dt>Cancellation reason</dt>
                  <dd>{selected.cancellationReason}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      )}

      {cancelTarget && (
        <div className="appointment-modal-backdrop">
          <section
            className="appointment-modal appointment-cancel-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-appointment-title"
          >
            <header>
              <div>
                <p>Appointment #{cancelTarget.id}</p>
                <h2 id="cancel-appointment-title">Cancel appointment</h2>
              </div>
              <button onClick={() => setCancelTarget(null)} aria-label="Close">
                <X />
              </button>
            </header>
            <p>
              Provide a reason for cancelling{" "}
              {cancelTarget.customerName ?? "this customer's"} appointment.
            </p>
            <textarea
              autoFocus
              maxLength={255}
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Cancellation reason"
            />
            <footer>
              <button
                className="is-secondary"
                onClick={() => setCancelTarget(null)}
              >
                Keep appointment
              </button>
              <button
                className="is-danger"
                disabled={!cancelReason.trim() || busyId === cancelTarget.id}
                onClick={() => void submitCancellation()}
              >
                <Ban />
                Cancel appointment
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagementPage;
