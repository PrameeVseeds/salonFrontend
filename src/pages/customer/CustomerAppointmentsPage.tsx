import {
  CalendarDays,
  Clock3,
  LogOut,
  Scissors,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CustomerBottomNav from "../../components/customer/CustomerBottomNav";
import { usePublicTheme } from "../../hooks/usePublicTheme";
import {
  cancelCustomerAppointment,
  createCustomerAppointment,
  getAvailableAppointmentSlots,
  getCustomerAppointments,
} from "../../services/appointmentService";
import {
  getCustomerProfile,
  logoutCustomer,
} from "../../services/customerAuthService";
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

const today = new Date().toISOString().slice(0, 10);
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
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const initialServiceId = params.get("service") ?? "";
  const isBookingPage = location.pathname === "/book-appointment";

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
    serviceId: string,
    choice: string,
    appointmentDate: string,
    staff = assignedEmployees,
  ) => {
    setEmployeeChoice(choice);
    setForm((current) => ({
      ...current,
      serviceId,
      employeeId: choice === "any" ? "" : choice,
      appointmentDate,
      startTime: "",
    }));
    setAvailableSlots([]);
    setSlotsError(null);
    setSlotEmployees({});
    if (!serviceId || !appointmentDate || !staff.length) return;
    setSlotsLoading(true);
    const candidates =
      choice === "any"
        ? staff
        : staff.filter((employee) => employee.id === Number(choice));
    Promise.all(
      candidates.map(async (employee) => ({
        employeeId: employee.id,
        slots: await getAvailableAppointmentSlots(
          Number(serviceId),
          employee.id,
          appointmentDate,
        ),
      })),
    )
      .then((results) => {
        const slotMap: Record<string, number> = {};
        results.forEach((result) =>
          result.slots.forEach((slot) => {
            if (!slotMap[slot]) slotMap[slot] = result.employeeId;
          }),
        );
        setSlotEmployees(slotMap);
        setAvailableSlots(Object.keys(slotMap).sort());
      })
      .catch((error) =>
        setSlotsError(
          getApiErrorMessage(error, "Unable to load available times."),
        ),
      )
      .finally(() => setSlotsLoading(false));
  };
  const selectService = async (serviceId: string) => {
    setAssignedEmployees([]);
    setEmployeeChoice("any");
    setAvailableSlots([]);
    setSlotEmployees({});
    setForm((current) => ({
      ...current,
      serviceId,
      employeeId: "",
      startTime: "",
    }));
    if (!serviceId) 
      return;
    const matches = (
      await Promise.all(
        employees.map(async (employee) => {
          try {
            const { data } = await getPublicAssignedEmployeeServices(
              employee.id,
            );
            return data.services.some(
              (service) => service.id === Number(serviceId),
            )
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
      loadSlots(serviceId, "any", form.appointmentDate, matches);
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
  const selectedService = useMemo(
    () => services.find((service) => service.id === Number(form.serviceId)),
    [form.serviceId, services],
  );

  const book = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const { data } = await createCustomerAppointment({
        serviceId: Number(form.serviceId),
        employeeId: employeeChoice === "any" ? null : Number(form.employeeId),
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        notes: form.notes.trim() || null,
      });
      setAppointments((current) => [...current, data.appointment]);
      setForm({
        serviceId: "",
        employeeId: "",
        appointmentDate: "",
        startTime: "",
        notes: "",
      });
      setAssignedEmployees([]);
      setEmployeeChoice("any");
      setAvailableSlots([]);
      setSlotEmployees({});
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
      <time>
        <strong>
          {new Date(`${item.appointmentDate}T00:00`).toLocaleDateString(
            undefined,
            { day: "2-digit" },
          )}
        </strong>
        <span>
          {new Date(`${item.appointmentDate}T00:00`).toLocaleDateString(
            undefined,
            { month: "short" },
          )}
        </span>
      </time>
      <div>
        <strong>{item.serviceName ?? `Service #${item.serviceId}`}</strong>
        <span>
          <Clock3 /> {item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}
        </span>
        <small>{item.employeeName ?? "Professional assigned by salon"}</small>
      </div>
      <b className={`is-${item.status.toLowerCase().replace(" ", "-")}`}>
        {item.status}
      </b>
      {cancellable && (
        <button type="button" onClick={() => setCancelTarget(item)}>
          Cancel
        </button>
      )}
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
            onClick={() => navigate("/dashboard")}
            aria-label="View your profile"
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
        <section className="customer-appointments-heading">
          <p>{isBookingPage ? "Plan your visit" : "Your schedule"}</p>
          <h1>{isBookingPage ? "Book an appointment" : "Bookings"}</h1>
          <span>{isBookingPage ? "Choose your preferred service and time." : "View and manage your salon visits."}</span>
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
              <p>{selectedService ? `${selectedService.name} · ${selectedService.durationMinutes} min · ${Number(selectedService.price).toFixed(2)}` : "Choose your service, professional, and preferred time."}</p>
            </div>
          </header>
          {!initialServiceId && (
          <label>
            <span>Service</span>
            <select
              value={form.serviceId}
              onChange={(e) => void selectService(e.target.value)}
              required
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option value={service.id} key={service.id}>
                  {service.name} · {service.durationMinutes} min ·{" "}
                  {Number(service.price).toFixed(2)}
                </option>
              ))}
            </select>
          </label>
          )}
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
                    loadSlots(form.serviceId, "any", form.appointmentDate)
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
                        form.serviceId,
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
                No professionals are assigned to this service.
              </p>
            )}
          </fieldset>
          <label className="customer-date-field">
            <span>Date</span>
            <span className="customer-date-picker">
              <CalendarDays aria-hidden="true" />
              <span className={form.appointmentDate ? "" : "is-placeholder"}>
                {form.appointmentDate
                  ? form.appointmentDate.split("-").reverse().join("-")
                  : "dd-mm-yyyy"}
              </span>
              <input
                type="date"
                aria-label="Appointment date"
                min={today}
                value={form.appointmentDate}
                onChange={(e) =>
                  loadSlots(form.serviceId, employeeChoice, e.target.value)
                }
                required
              />
            </span>
          </label>
          <fieldset className="customer-time-slots">
            <legend>Available times</legend>
            {!form.appointmentDate || !form.serviceId ? (
              <p>Select a service and date to view times.</p>
            ) : !assignedEmployees.length ? (
              <p>No assigned professionals are available for this service.</p>
            ) : slotsLoading ? (
              <p>Checking available times...</p>
            ) : slotsError ? (
              <p className="is-error">{slotsError}</p>
            ) : availableSlots.length ? (
              <div>
                {availableSlots.map((slot) => (
                  <button
                    className={form.startTime === slot ? "is-selected" : ""}
                    type="button"
                    key={slot}
                    onClick={() =>
                      setForm({
                        ...form,
                        startTime: slot,
                        employeeId: String(slotEmployees[slot]),
                      })
                    }
                  >
                    {slot.slice(0, 5)}
                  </button>
                ))}
              </div>
            ) : (
              <p>No available times for this date.</p>
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
          <button className="customer-new-booking" type="button" onClick={() => navigate("/services")}>Book a new appointment</button>
        )}
        {!isBookingPage && (
          <>
        <section className="customer-appointments-list">
          <header>
            <h2>Upcoming</h2>
            <span>{upcoming.length}</span>
          </header>
          {upcoming.length ? (
            upcoming.map((item) => card(item, item.status === "Scheduled"))
          ) : (
            <div className="customer-appointment-empty">
              No upcoming appointments.
            </div>
          )}
        </section>
        <section className="customer-appointments-list">
          <header><h2>Cancelled</h2><span>{cancelled.length}</span></header>
          {cancelled.length ? cancelled.map((item) => card(item, false)) : <div className="customer-appointment-empty">No cancelled bookings.</div>}
        </section>
        <section className="customer-appointments-list">
          <header><h2>Past bookings</h2><span>{past.length}</span></header>
          {past.length ? past.map((item) => card(item, false)) : <div className="customer-appointment-empty">No past bookings.</div>}
        </section>
          </>
        )}
      </div>
      <CustomerBottomNav active="bookings" />
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
