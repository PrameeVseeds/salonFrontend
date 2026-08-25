import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  LogOut,
  Scissors,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CustomerBottomNav from "../../components/customer/CustomerBottomNav";
import CustomerProfileModal from "../../components/customer/CustomerProfileModal";
import { usePublicTheme } from "../../hooks/usePublicTheme";
import {
  cancelCustomerAppointment,
  createCustomerAppointment,
  getAvailableAppointmentSlots,
  getCustomerAppointments,
} from "../../services/appointmentService";
import { getCustomerProfile, logoutCustomer, } from "../../services/customerAuthService";
import { getPublicServices } from "../../services/salonService";
import { getPublicEmployees } from "../../services/employeeService";
import { getPublicAssignedEmployeeServices } from "../../services/employeeServiceAssignmentService";
import type { Appointment } from "../../types/appointment";
import type { Customer } from "../../types/customer";
import type { SalonService } from "../../types/service";
import type { Employee } from "../../types/employee";
import { getApiErrorMessage } from "../../utils/apiError";
import "./customerDashboardPage.css";
import "./customerAppointmentsPage.css";

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = localDateKey(new Date());
const CustomerAppointmentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { brand, style } = usePublicTheme();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [services, setServices] = useState<SalonService[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
  const [employeeChoice, setEmployeeChoice] = useState("any");
  const [slotEmployees, setSlotEmployees] = useState<Record<string, number>>(
    {},
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    serviceId: params.get("service") ?? "",
    serviceIds: params.get("service") ? [params.get("service")!] : [] as string[],
    employeeId: "",
    appointmentDate: "",
    startTime: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [bookingFilter, setBookingFilter] = useState<"upcoming" | "cancelled" | "past">("upcoming");
  const [visibleBookingCount, setVisibleBookingCount] = useState(10);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const initialServiceId = params.get("service") ?? "";
  const isBookingPage = location.pathname === "/book-appointment";

  const visibleAvailableSlots = useMemo(
    () => availableSlots.filter((slot) =>
      new Date(`${form.appointmentDate}T${slot}`).getTime() > currentTime,
    ),
    [availableSlots, form.appointmentDate, currentTime],
  );

  useEffect(() => {
    const clockTimer = window.setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    Promise.allSettled([
      getCustomerProfile(),
      getPublicServices(),
      getPublicEmployees(),
      getCustomerAppointments(),
    ]).then(([profile, serviceResult, employeeResult, bookingResult]) => {
      if (profile.status === "fulfilled")
        setCustomer(profile.value.data.customer);
      if (serviceResult.status === "fulfilled")
        setServices(
          serviceResult.value.data.services.filter((item) => item.isActive),
        );
      if (employeeResult.status === "fulfilled")
        setEmployees(
          employeeResult.value.data.employees.filter((item) => item.isActive),
        );
      if (bookingResult.status === "fulfilled")
        setAppointments(bookingResult.value.data.appointments);
      else
        setMessage({
          type: "error",
          text: getApiErrorMessage(
            bookingResult.reason,
            "Unable to load your appointments.",
          ),
        });
    });
  }, []);
  useEffect(() => {
    if (!initialServiceId || !employees.length) return;
    let active = true;
    Promise.all(
      employees.map(async (employee) => {
        try {
          const { data } = await getPublicAssignedEmployeeServices(employee.id);
          return data.services.some(
            (service) => service.id === Number(initialServiceId),
          )
            ? employee
            : null;
        } catch {
          return null;
        }
      }),
    ).then((matches) => {
      if (active)
        setAssignedEmployees(
          matches.filter((employee): employee is Employee => employee !== null),
        );
    });
    return () => {
      active = false;
    };
  }, [employees, initialServiceId]);
  const loadSlots = (
    serviceIds: string[],
    choice: string,
    appointmentDate: string,
    staff = assignedEmployees,
  ) => {
    setEmployeeChoice(choice);
    setForm((current) => ({
      ...current,
      serviceId: serviceIds[0] ?? "",
      serviceIds,
      employeeId: choice === "any" ? "" : choice,
      appointmentDate,
      startTime: "",
    }));
    setAvailableSlots([]);
    setSlotsError(null);
    setSlotsMessage(null);
    setSlotEmployees({});
    if (!serviceIds.length || !appointmentDate) return;
    setSlotsLoading(true);
    const candidates =
      choice === "any"
        ? [null]
        : staff.filter((employee) => employee.id === Number(choice));
    Promise.all(
      (candidates.length ? candidates : [null]).map(async (employee) => ({
        employeeId: employee?.id ?? null,
        availability: await getAvailableAppointmentSlots(
          serviceIds.map(Number),
          employee?.id ?? null,
          appointmentDate,
        ),
      })),
    )
      .then((results) => {
        const slotMap: Record<string, number> = {};
        const uniqueSlots = new Set<string>();
        results.forEach((result) =>
          result.availability.slots.forEach((slot) => {
            uniqueSlots.add(slot);
            if (result.employeeId !== null && !slotMap[slot]) slotMap[slot] = result.employeeId;
          }),
        );
        setSlotEmployees(slotMap);
        setAvailableSlots([...uniqueSlots].sort());
        if (!uniqueSlots.size)
          setSlotsMessage(results.find((result) => result.availability.message)?.availability.message ?? null);
      })
      .catch((error) =>
        setSlotsError(
          getApiErrorMessage(error, "Unable to load available times."),
        ),
      )
      .finally(() => setSlotsLoading(false));
  };
  const selectServices = async (serviceIds: string[]) => {
    setAssignedEmployees([]);
    setEmployeeChoice("any");
    setAvailableSlots([]);
    setSlotEmployees({});
    setSlotsMessage(null);
    setForm((current) => ({
      ...current,
      serviceId: serviceIds[0] ?? "",
      serviceIds,
      employeeId: "",
      startTime: "",
    }));
    if (!serviceIds.length)
      return;
    const matches = (
      await Promise.all(
        employees.map(async (employee) => {
          try {
            const { data } = await getPublicAssignedEmployeeServices(
              employee.id,
            );
            return serviceIds.every((serviceId) => data.services.some(
              (service) => service.id === Number(serviceId),
            ))
              ? employee
              : null;
          } catch {
            return null;
          }
        }),
      )
    ).filter((employee): employee is Employee => employee !== null);
    setAssignedEmployees(matches);
    if (form.appointmentDate)
      loadSlots(serviceIds, "any", form.appointmentDate, matches);
  };
  const upcoming = useMemo(
    () =>
      appointments
        .filter(
          (item) =>
            (item.status === "Scheduled" || item.status === "In Progress") &&
            item.appointmentDate >= today,
        )
        .sort((a, b) =>
          `${a.appointmentDate}${a.startTime}`.localeCompare(
            `${b.appointmentDate}${b.startTime}`,
          ),
        ),
    [appointments],
  );
  const cancelled = useMemo(
    () =>
      appointments
        .filter((item) => item.status === "Cancelled")
        .sort((a, b) =>
          `${b.appointmentDate}${b.startTime}`.localeCompare(
            `${a.appointmentDate}${a.startTime}`,
          ),
        ),
    [appointments],
  );
  const past = useMemo(
    () =>
      appointments
        .filter(
          (item) =>
            item.status === "Completed" ||
            ((item.status === "Scheduled" || item.status === "In Progress") &&
              item.appointmentDate < today),
        )
        .sort((a, b) =>
          `${b.appointmentDate}${b.startTime}`.localeCompare(
            `${a.appointmentDate}${a.startTime}`,
          ),
        ),
    [appointments],
  );
  const selectedServices = useMemo(
    () => form.serviceIds.map(Number).map((id) => services.find((service) => service.id === id)).filter((service): service is SalonService => Boolean(service)),
    [form.serviceIds, services],
  );
  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input)
      return;
    try {
      input.showPicker();
    } catch {
      input.focus();
      input.click();
    }
  };
  const filteredBookings = bookingFilter === "upcoming"
    ? upcoming
    : bookingFilter === "cancelled"
      ? cancelled
      : past;
  const filteredBookingTitle = bookingFilter === "upcoming"
    ? "Upcoming"
    : bookingFilter === "cancelled"
      ? "Cancelled"
      : "Past bookings";

  const book = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const { data } = await createCustomerAppointment({
        serviceId: Number(form.serviceId),
        serviceIds: form.serviceIds.map(Number),
        employeeId: employeeChoice === "any" ? null : Number(form.employeeId),
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        notes: form.notes.trim() || null,
      });
      setAppointments((current) => [...current, data.appointment]);
      setForm({
        serviceId: "",
        serviceIds: [],
        employeeId: "",
        appointmentDate: "",
        startTime: "",
        notes: "",
      });
      setAssignedEmployees([]);
      setEmployeeChoice("any");
      setAvailableSlots([]);
      setSlotEmployees({});
      setSlotsMessage(null);
      setMessage({ type: "success", text: "Appointment booked successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Unable to book this appointment."),
      });
    } finally {
      setBusy(false);
    }
  };
  const cancelBooking = async () => {
    if (!cancelTarget)
      return;
    setBusy(true);
    try {
      const { data } = await cancelCustomerAppointment(
        cancelTarget.id,
        "Cancelled by customer",
      );
      setAppointments((current) =>
        current.map((item) =>
          item.id === data.appointment.id ? data.appointment : item,
        ),
      );
      setCancelTarget(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Unable to cancel this appointment."),
      });
    } finally {
      setBusy(false);
    }
  };
  const signOut = () => {
    logoutCustomer();
    navigate("/", { replace: true });
  };
  const card = (item: Appointment, cancellable: boolean) => (
    <article className="customer-appointment-card" key={item.id}>
      <span className="customer-appointment-image">
        {services.find((service) => service.id === item.serviceId)?.imageUrl ? (
          <img src={services.find((service) => service.id === item.serviceId)?.imageUrl} alt="" />
        ) : (
          <Scissors aria-hidden="true" />
        )}
      </span>
      <div className="customer-appointment-details">
        <strong>
          {item.services?.length ? item.services.map((service) => service.serviceName).join(" + ") : item.serviceName ??
            services.find((service) => service.id === item.serviceId)?.name ??
            "Salon service"}
        </strong>
        <span>
          <Clock3 /> {item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}
        </span>
        <small>
          {item.services?.length ? [...new Set(item.services.map((service) => service.employeeName).filter(Boolean))].join(" + ") : item.employeeName ??
            (() => {
              const employee = employees.find(
                (candidate) => candidate.id === item.employeeId,
              );
              return employee
                ? `${employee.firstName} ${employee.lastName}`
                : "Professional assigned by salon";
            })()}
        </small>
        {cancellable && (
          <button type="button" onClick={() => setCancelTarget(item)}>
            Cancel
          </button>
        )}
      </div>
      <aside className="customer-appointment-meta">
        <b className={`is-${item.status.toLowerCase().replace(" ", "-")}`}>
          {item.status}
        </b>
        <time>
          <strong>
            {new Date(`${item.appointmentDate}T00:00`).toLocaleDateString(undefined, { day: "2-digit" })}
          </strong>
          <span>
            {new Date(`${item.appointmentDate}T00:00`).toLocaleDateString(undefined, { month: "short" })}
          </span>
        </time>
      </aside>
    </article>
  );

  return (
    <main className="customer-appointments-page" style={style}>
      <header className="customer-dashboard_header">
        <div className="customer-dashboard_brand">
          <span>
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={`${brand.salonName} logo`} />
            ) : (
              <Scissors />
            )}
          </span>
          <strong>{brand.salonName}</strong>
        </div>
        <div className="customer-dashboard_header-actions">
          <button
            className="customer-profile-trigger"
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="View your profile"
            aria-expanded={profileOpen}
          >
            {customer?.profileImage ? (
              <img src={customer.profileImage} alt="" />
            ) : (
              <UserRound />
            )}
          </button>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            aria-label="Sign out"
          >
            <LogOut />
          </button>
        </div>
      </header>
      <div className="customer-appointments-content">
        <section className={`customer-appointments-heading${isBookingPage ? " is-booking" : ""}`}>
          {isBookingPage && (
            <button
              className="customer-booking-back"
              type="button"
              aria-label="Back to services"
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/services")}
            >
              <ArrowLeft aria-hidden="true" />
            </button>
          )}
          <div className="customer-appointments-heading-copy">
            <p>{isBookingPage ? "Plan your visit" : "Your schedule"}</p>
            <h1>{isBookingPage ? "Book an appointment" : "Bookings"}</h1>
            <span>{isBookingPage ? "Choose your preferred service and time." : "View and manage your salon visits."}</span>
          </div>
        </section>
        {isBookingPage && (
          <form
            className="customer-booking-form"
            onSubmit={(event) => void book(event)}
          >
            <header>
              <CalendarDays />
              <div>
                <h2>Book an appointment</h2>
                <p>
                  {selectedServices.length ? `${selectedServices.length} service${selectedServices.length === 1 ? "" : "s"} · 
                ${selectedServices.reduce((total, service) => total + service.durationMinutes, 0)} min · 
                ${selectedServices.reduce((total, service) => total + Number(service.price), 0).toFixed(2)}`
                    : "Choose your service, professional, and preferred time."}
                </p>
              </div>
            </header>
            <fieldset className="customer-service-options">
              <legend>Services</legend>
              <div>
                {services.map((service) => (
                  <label key={service.id} className={form.serviceIds.includes(String(service.id)) ? "is-selected" : ""}>
                    <input type="checkbox" checked={form.serviceIds.includes(String(service.id))}
                      onChange={() => {
                        const id = String(service.id);
                        const next = form.serviceIds.includes(id) ? form.serviceIds.filter((item) => item !== id) : [...form.serviceIds, id];
                        void selectServices(next);
                      }} />
                    <strong>{service.name}</strong>
                    <small>{service.durationMinutes} min · {Number(service.price).toFixed(2)}</small>
                    <span className="customer-service-option-image" aria-hidden="true">
                      {service.imageUrl ? <img src={service.imageUrl} alt="" /> : <Scissors />}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="customer-professional-field">
              <legend>
                Professional <small>(optional)</small>
              </legend>
              {!form.serviceId ? (
                <p className="customer-professional-empty">
                  Select a service to see its professionals.
                </p>
              ) : assignedEmployees.length ? (
                <div className="customer-professional-options">
                  <button
                    className={employeeChoice === "any" ? "is-selected" : ""}
                    type="button"
                    onClick={() =>
                      loadSlots(form.serviceIds, "any", form.appointmentDate)
                    }
                  >
                    <span>
                      <UserRound />
                    </span>
                    <strong>Any professional</strong>
                    <small>Earliest available</small>
                  </button>
                  {assignedEmployees.map((employee) => (
                    <button
                      className={
                        employeeChoice === String(employee.id)
                          ? "is-selected"
                          : ""
                      }
                      type="button"
                      key={employee.id}
                      onClick={() =>
                        loadSlots(
                          form.serviceIds,
                          String(employee.id),
                          form.appointmentDate,
                        )
                      }
                    >
                      <span>
                        {employee.profileImage ? (
                          <img src={employee.profileImage} alt="" />
                        ) : (
                          <UserRound />
                        )}
                      </span>
                      <strong>
                        {employee.firstName} {employee.lastName}
                      </strong>
                      <small>Select professional</small>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="customer-professional-empty">
                  No professional selection is needed. The salon can assign one later.
                </p>
              )}
            </fieldset>
            <label className="customer-date-field">
              <span>Date</span>
              <span
                className="customer-date-picker"
                role="button"
                tabIndex={0}
                onClick={openDatePicker}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openDatePicker();
                  }
                }}
              >
                <CalendarDays aria-hidden="true" />
                <span className={form.appointmentDate ? "" : "is-placeholder"}>
                  {form.appointmentDate
                    ? form.appointmentDate.split("-").reverse().join("-")
                    : "dd-mm-yyyy"}
                </span>
                <input
                  ref={dateInputRef}
                  type="date"
                  aria-label="Appointment date"
                  min={today}
                  value={form.appointmentDate}
                  onChange={(e) =>
                    loadSlots(form.serviceIds, employeeChoice, e.target.value)
                  }
                  required
                />
              </span>
            </label>
            <fieldset className="customer-time-slots">
              <legend>Available times</legend>
              {!form.appointmentDate || !form.serviceId ? (
                <p>Select a service and date to view times.</p>
              ) : slotsLoading ? (
                <p>Checking available times...</p>
              ) : slotsError ? (
                <p className="is-error">{slotsError}</p>
              ) : visibleAvailableSlots.length ? (
                <div>
                  {visibleAvailableSlots.map((slot) => (
                    <button
                      className={form.startTime === slot ? "is-selected" : ""}
                      type="button"
                      key={slot}
                      onClick={() =>
                        setForm({
                          ...form,
                          startTime: slot,
                          employeeId: employeeChoice !== "any" && slotEmployees[slot] ? String(slotEmployees[slot]) : "",
                        })
                      }
                    >
                      {slot.slice(0, 5)}
                    </button>
                  ))}
                </div>
              ) : (
                <p>{slotsMessage ?? "No available times for this date."}</p>
              )}
            </fieldset>
            <label>
              <span>Notes (optional)</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any preferences for your visit"
              />
            </label>
            {message && (
              <p className={`customer-booking-message is-${message.type}`}>
                {message.text}
              </p>
            )}
            <button disabled={busy || !form.startTime}>
              {busy ? "Booking..." : "Confirm appointment"}
            </button>
          </form>
        )}
        {!isBookingPage && (
          <>
            <nav className="customer-booking-filters" aria-label="Filter bookings">
              {([
                ["upcoming", "Upcoming", upcoming.length],
                ["cancelled", "Cancelled", cancelled.length],
                ["past", "Past", past.length],
              ] as const).map(([value, label, count]) => (
                <button
                  className={bookingFilter === value ? "is-active" : ""}
                  type="button"
                  key={value}
                  onClick={() => { setBookingFilter(value); setVisibleBookingCount(10); }}
                  aria-pressed={bookingFilter === value}
                >
                  <span>{label}</span>
                  <b>{count}</b>
                </button>
              ))}
            </nav>
            <section className="customer-appointments-list">
              <header>
                <h2>{filteredBookingTitle}</h2>
                <span>{filteredBookings.length}</span>
              </header>
              {filteredBookings.length ? (
                filteredBookings.slice(0, visibleBookingCount).map((item) => card(item, bookingFilter === "upcoming" && item.status === "Scheduled"))
              ) : (
                <div className="customer-appointment-empty">
                  No {filteredBookingTitle.toLowerCase()}.
                </div>
              )}
              {filteredBookings.length > visibleBookingCount && (
                <button className="customer-bookings-more" type="button" onClick={() => setVisibleBookingCount((count) => count + 10)}>
                  Show more bookings
                </button>
              )}
            </section>
          </>
        )}
      </div>
      <CustomerBottomNav active={isBookingPage ? "services" : "bookings"} />
      {customer && <CustomerProfileModal open={profileOpen} initialTab="profile" customer={customer} onUpdated={setCustomer} onClose={() => setProfileOpen(false)} />}
      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel appointment?"
        message="This appointment will be cancelled and the salon will be notified."
        confirmLabel="Cancel appointment"
        busy={busy}
        onConfirm={() => void cancelBooking()}
        onCancel={() => setCancelTarget(null)}
      />
      <ConfirmDialog
        open={logoutOpen}
        title="Sign out?"
        message="Are you sure you want to sign out of your customer account?"
        confirmLabel="Sign out"
        onConfirm={signOut}
        onCancel={() => setLogoutOpen(false)}
      />
    </main>
  );
};

export default CustomerAppointmentsPage;
