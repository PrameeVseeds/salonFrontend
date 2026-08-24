import { Ban, CalendarDays, CheckCircle2, Clock3, Eye, Play, RefreshCw, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cancelAppointment, completeAppointment, getAppointments, startAppointment } from "../../services/appointmentService";
import type { Appointment, AppointmentStatus } from "../../types/appointment";
import { getApiErrorMessage } from "../../utils/apiError";
import "./appointmentManagementPage.css";

type StatusFilter = AppointmentStatus | "Active" | "";
const statuses: StatusFilter[] = ["Active", "", "Scheduled", "In Progress", "Completed", "Cancelled"];

const AppointmentManagementPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const filters = { date: date || undefined, search: appliedSearch || undefined };
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
        const { data } = await getAppointments({ ...filters, status: status || undefined });
        setAppointments(data.appointments);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load appointments."));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [date, status, appliedSearch]);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => void load(), 0);
    const refreshTimer = window.setInterval(() => void load(true), 30_000);
    return () => {
      window.clearTimeout(initialLoadTimer);
      window.clearInterval(refreshTimer);
    };
  }, [load]);

  useEffect(() => {
    const clockTimer = window.setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => window.clearInterval(clockTimer);
  }, []);

  const canStart = (appointment: Appointment) => {
    const startsAt = new Date(`${appointment.appointmentDate}T${appointment.startTime}`).getTime();
    const endsAt = new Date(`${appointment.appointmentDate}T${appointment.endTime}`).getTime();
    return currentTime >= startsAt && currentTime <= endsAt;
  };

  const counts = useMemo(() => ({
    total: appointments.length,
    scheduled: appointments.filter((item) => item.status === "Scheduled").length,
    active: appointments.filter((item) => item.status === "In Progress").length,
    completed: appointments.filter((item) => item.status === "Completed").length,
  }), [appointments]);
  const orderedAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const appointmentTime = (appointment: Appointment) =>
      new Date(`${appointment.appointmentDate}T${appointment.startTime}`).getTime();
    return [...appointments].sort((first, second) => {
      const firstTime = appointmentTime(first);
      const secondTime = appointmentTime(second);
      const distance = Math.abs(firstTime - today) - Math.abs(secondTime - today);
      return distance || firstTime - secondTime;
    });
  }, [appointments]);

  const replaceAppointment = (updated: Appointment) => {
    setAppointments((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
    setSelected((current) => current?.id === updated.id ? { ...current, ...updated } : current);
  };

  const changeStatus = async (appointment: Appointment) => {
    setBusyId(appointment.id);
    setError(null);
    setSuccess(null);
    try {
      const response = appointment.status === "Scheduled" ? await startAppointment(appointment.id) : await completeAppointment(appointment.id);
      replaceAppointment(response.data.appointment);
      setSuccess(response.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to update appointment."));
    } finally {
      setBusyId(null);
    }
  };

  const submitCancellation = async () => {
    if (!cancelTarget || !cancelReason.trim())
      return;

    setBusyId(cancelTarget.id);
    setError(null);
    try {
      const response = await cancelAppointment(cancelTarget.id, cancelReason.trim());
      replaceAppointment(response.data.appointment);
      setCancelTarget(null);
      setCancelReason("");
      setSuccess(response.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to cancel appointment."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="appointment-page">
      <header className="appointment-heading">
        <div><p className="dashboard-eyebrow">Daily operations</p><h1>Appointments</h1><p>Track arrivals, services, completions, and cancellations.</p></div>
        <button className="appointment-refresh" onClick={() => void load()} disabled={loading}><RefreshCw />Refresh</button>
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
        <form className="appointment-filters" onSubmit={(event) => { event.preventDefault(); setAppliedSearch(search.trim()); }}>
          <label>
            <span>Search customer</span>
            <div>
              <Search />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone, or email" />
            </div>
          </label>
          <label>
            <span>Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
              {statuses.map((item) => (
                <option key={item || "all"} value={item}>
                  {item === "Active" ? "Scheduled & In Progress" : item || "All statuses"}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Apply</button>
          <button type="button" className="is-secondary" onClick={() => { setSearch(""); setAppliedSearch(""); setDate(""); setStatus("Active"); }}>Clear</button>
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
              {orderedAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td data-label="Date & time"><strong>{appointment.appointmentDate}</strong><small>{appointment.startTime.slice(0, 5)} - {appointment.endTime.slice(0, 5)}</small></td>
                  <td data-label="Customer">
                    <strong>{appointment.customerName ?? `Customer #${appointment.customerId}`}</strong><small>{appointment.customerPhone ?? appointment.customerEmail}</small>
                  </td>
                  <td data-label="Service">
                    <strong>{appointment.serviceName ?? `Service #${appointment.serviceId}`}</strong>
                    <small>{appointment.serviceDurationMinutes ? `${appointment.serviceDurationMinutes} minutes` : ""}</small>
                  </td>
                  <td data-label="Employee">{appointment.employeeName ?? (appointment.employeeId ? `Employee #${appointment.employeeId}` : "Unassigned")}</td>
                  <td data-label="Amount">{Number(appointment.totalAmount).toFixed(2)}</td>
                  <td data-label="Status">
                    <span className={`appointment-status is-${appointment.status.toLowerCase().replace(" ", "-")}`}>{appointment.status}</span></td>
                  <td data-label="Actions">
                    <div className="appointment-actions">
                      <button className="is-view" title="View details" onClick={() => setSelected(appointment)}><Eye /></button>
                      {(appointment.status === "Scheduled" || appointment.status === "In Progress") && <button disabled={busyId === appointment.id || (appointment.status === "Scheduled" && !canStart(appointment))} title={appointment.status === "Scheduled" && !canStart(appointment) ? "This appointment can only be started during its scheduled time." : undefined} onClick={() => void changeStatus(appointment)}>{appointment.status === "Scheduled" ? <Play /> : <CheckCircle2 />}{appointment.status === "Scheduled" ? "Start" : "Complete"}</button>}
                      {(appointment.status === "Scheduled" || appointment.status === "In Progress") && <button className="is-cancel" title="Cancel appointment" onClick={() => setCancelTarget(appointment)}><Ban /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !appointments.length && <tr><td className="appointment-empty" colSpan={7}><Clock3 />No appointments match these filters.</td></tr>}
              {loading && <tr><td className="appointment-empty" colSpan={7}>Loading appointments...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {selected && <div className="appointment-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="appointment-modal" role="dialog" aria-modal="true" aria-labelledby="appointment-details-title"><header><div><p>Appointment #{selected.id}</p><h2 id="appointment-details-title">Appointment details</h2></div><button onClick={() => setSelected(null)} aria-label="Close"><X /></button></header><dl>
        <div>
          <dt>Customer</dt>
          <dd>{selected.customerName ?? `#${selected.customerId}`}
            <small>{selected.customerPhone}<br />{selected.customerEmail}</small>
          </dd>
        </div>
        <div>
          <dt>Service</dt>
          <dd>{selected.serviceName ?? `#${selected.serviceId}`}</dd>
        </div>
        <div>
          <dt>Employee</dt>
          <dd>{selected.employeeName ?? "Unassigned"}</dd></div>
        <div>
          <dt>Schedule</dt>
          <dd>{selected.appointmentDate}, {selected.startTime.slice(0, 5)} - {selected.endTime.slice(0, 5)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className={`appointment-status is-${selected.status.toLowerCase().replace(" ", "-")}`}>{selected.status}</span>
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
        {selected.cancellationReason &&
          <div className="is-wide">
            <dt>Cancellation reason</dt>
            <dd>{selected.cancellationReason}</dd>
          </div>}
      </dl>
      </section>
      </div>}

      {cancelTarget &&
        <div className="appointment-modal-backdrop">
          <section className="appointment-modal appointment-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-appointment-title">
            <header>
              <div>
                <p>Appointment #{cancelTarget.id}</p>
                <h2 id="cancel-appointment-title">Cancel appointment</h2>
              </div>
              <button onClick={() => setCancelTarget(null)} aria-label="Close">
                <X />
              </button>
            </header>
            <p>Provide a reason for cancelling {cancelTarget.customerName ?? "this customer's"} appointment.</p>
            <textarea autoFocus maxLength={255} value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Cancellation reason" />
            <footer>
              <button className="is-secondary" onClick={() => setCancelTarget(null)}>Keep appointment</button>
              <button className="is-danger" disabled={!cancelReason.trim() || busyId === cancelTarget.id} onClick={() => void submitCancellation()}>
                <Ban />
                Cancel appointment
              </button>
            </footer>
          </section>
        </div>}
    </div>
  );
};

export default AppointmentManagementPage;
