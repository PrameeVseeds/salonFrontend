import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAppointments, startAppointment } from "../../services/appointmentService";
import type { Appointment } from "../../types/appointment";
import { getApiErrorMessage } from "../../utils/apiError";
import "./todayAppointmentsPage.css";

const localDateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const TODAY_APPOINTMENTS_PER_PAGE = 8;

const TodayAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [currentPage, setCurrentPage] = useState(1);
  const today = localDateKey();

  const load = useCallback(async () => {
    try {
      const { data } = await getAppointments({ date: localDateKey(), status: "Scheduled" });
      setAppointments(data.appointments);
      setError(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load today's appointments."));
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { setNow(Date.now()); void load(); }, 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const ordered = useMemo(() => [...appointments].sort((first, second) =>
    first.startTime.localeCompare(second.startTime)), [appointments]);
  const totalPages = Math.max(1, Math.ceil(ordered.length / TODAY_APPOINTMENTS_PER_PAGE));
  const visibleAppointments = useMemo(() => {
    const start = (currentPage - 1) * TODAY_APPOINTMENTS_PER_PAGE;
    return ordered.slice(start, start + TODAY_APPOINTMENTS_PER_PAGE);
  }, [currentPage, ordered]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const canStart = (appointment: Appointment) => {
    const start = new Date(`${appointment.appointmentDate}T${appointment.startTime}`).getTime();
    const end = new Date(`${appointment.appointmentDate}T${appointment.endTime}`).getTime();
    return now >= start && now <= end;
  };

  const start = async (appointment: Appointment) => {
    setBusyId(appointment.id);
    setError(null);
    try {
      await startAppointment(appointment.id);
      setAppointments((current) => current.filter((item) => item.id !== appointment.id));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to start this appointment."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="today-appointments-screen">
      <header>
        <span className="today-appointments-icon"><CalendarDays aria-hidden="true" /></span>
        <div className="today-appointments-heading">
          <small>DAILY OPERATIONS</small>
          <h1>Today's appointments</h1>
          <p>{new Date(`${today}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="today-appointments-summary">
          <strong>{ordered.length}</strong>
          <span>Scheduled today</span>
        </div>
      </header>

      {error && <p className="today-appointments-error">{error}</p>}
      <section className="today-appointments-list">
        {ordered.length ? visibleAppointments.map((appointment) => (
          <article key={appointment.id}>
            <time>
              <Clock3 /> 
              <strong>{appointment.startTime.slice(0, 5)}</strong>
              <small>{appointment.endTime.slice(0, 5)}</small>
              </time>
            <div>
              <small>Customer</small>
              <strong>{appointment.customerName ?? `Customer #${appointment.customerId}`}</strong>
              </div>
            <div>
              <small>Service</small>
              <strong>{appointment.services?.length ? appointment.services.map((service) => service.serviceName).join(" + ") :
               appointment.serviceName ?? `Service #${appointment.serviceId}`}
               </strong>
               </div>
            <div>
              <small>Amount</small>
              <strong>Rs. {Number(appointment.totalAmount).toFixed(2)}</strong>
            </div>
            <button type="button" disabled={busyId === appointment.id || !canStart(appointment)} onClick={() => void start(appointment)}>
              <Play aria-hidden="true" /> {busyId === appointment.id ? "Starting..." : "Start"}
            </button>
          </article>
        )) : <div className="today-appointments-empty">
          No scheduled appointments for today.
          </div>}
      </section>
      {ordered.length > 0 && (
        <nav className="today-pagination" aria-label="Today's appointment pages">
          <span>
            Showing {(currentPage - 1) * TODAY_APPOINTMENTS_PER_PAGE + 1}–{Math.min(currentPage * TODAY_APPOINTMENTS_PER_PAGE, ordered.length)} of {ordered.length}
          </span>
          <div>
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
              <ChevronLeft /> Previous
            </button>
            <strong>Page {currentPage} of {totalPages}</strong>
            <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
              Next <ChevronRight />
            </button>
          </div>
        </nav>
      )}
    </main>
  );
};

export default TodayAppointmentsPage;
