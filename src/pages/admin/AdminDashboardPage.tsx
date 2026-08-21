import { CalendarDays, CheckCircle2, ChevronRight, Clock3, Scissors, Sparkles, UserRoundCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAppointments } from "../../services/appointmentService";
import { getEmployees } from "../../services/employeeService";
import { getServices } from "../../services/salonService";
import type { Admin } from "../../types/admin";
import type { Appointment } from "../../types/appointment";
import DashboardOperationsCharts from "../../components/admin/DashboardOperationsCharts";

interface AdminDashboardPageProps {
  user: Admin;
}

const today = () => {
  const value = new Date();
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
};

const AdminDashboardPage = ({ user }: AdminDashboardPageProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [serviceCount, setServiceCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([getAppointments(), getEmployees(), getServices()])
      .then(([appointmentResponse, employeeResponse, serviceResponse]) => {
        setAppointments(appointmentResponse.data.appointments);
        setEmployeeCount(employeeResponse.data.employees.filter((employee) => employee.isActive).length);
        setServiceCount(serviceResponse.data.services.filter((service) => service.isActive).length);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => ({
    scheduled: appointments.filter((item) => item.appointmentDate === today() && item.status === "Scheduled").length,
    active: appointments.filter((item) => item.appointmentDate === today() && item.status === "In Progress").length,
    completed: appointments.filter((item) => item.appointmentDate === today() && item.status === "Completed").length,
  }), [appointments]);
  const todaysAppointments = useMemo(() => appointments.filter((item) => item.appointmentDate === today()), [appointments]);

  return <>
    <section className="dashboard-welcome">
      <div>
        <p className="dashboard-eyebrow">Daily workspace</p>
        <h1>Welcome back, {user.firstName}</h1>
        <p>Manage today's salon operations from one focused workspace.</p>
      </div>
      <span className="dashboard-role-badge">Administrator</span>
    </section>
    {error && <p className="dashboard-inline-error">Some dashboard information could not be loaded.</p>}
    <section className="dashboard-metric-grid" aria-label="Today's salon summary">
      <article>
        <span>
          <CalendarDays />
        </span>
        <div>
          <small>Today's appointments</small>
          <strong>{loading ? "--" : todaysAppointments.length}</strong>
        </div>
      </article>
      <article>
        <span>
          <Clock3 />
        </span>
        <div>
          <small>Waiting to arrive</small>
          <strong>{loading ? "--" : summary.scheduled}</strong>
        </div>
      </article>
      <article>
        <span>
          <Scissors />
        </span>
        <div>
          <small>In progress</small>
          <strong>{loading ? "--" : summary.active}</strong>
        </div>
      </article>
      <article>
        <span><CheckCircle2 /></span>
        <div>
          <small>Completed today</small>
          <strong>{loading ? "--" : summary.completed}</strong>
        </div>
      </article>
    </section>
    <DashboardOperationsCharts appointments={appointments} loading={loading} />
    <section className="dashboard-two-column">
      <div>
        <div className="dashboard-section-heading">
          <div>
            <h2>Today's schedule</h2>
            <p>Appointments booked for {today()}.</p>
          </div>
          <Link to="/admin/appointments">View all</Link>
        </div>
        <div className="dashboard-schedule-card">
          {todaysAppointments.slice().sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 6).map((appointment) => <article key={appointment.id}><time>{appointment.startTime.slice(0, 5)}</time><div><strong>{appointment.customerName ?? `Customer #${appointment.customerId}`}</strong><small>{appointment.serviceName ?? `Service #${appointment.serviceId}`} · {appointment.employeeName ?? "Unassigned"}</small></div><span className={`dashboard-status is-${appointment.status.toLowerCase().replace(" ", "-")}`}>{appointment.status}</span></article>)}
          {!loading && !todaysAppointments.length && <p className="dashboard-empty">No appointments scheduled for today.</p>}
          {loading && <p className="dashboard-empty">Loading today's appointments...</p>}
        </div>
      </div>
      <div>
        <div className="dashboard-section-heading">
          <div>
            <h2>Quick actions</h2>
            <p>Open frequently used salon tools.</p>
          </div>
        </div>
        <div className="dashboard-action-list">
          <Link to="/admin/appointments">
            <CalendarDays />
            <div>
              <strong>Manage appointments</strong>
              <small>Start, complete, or cancel bookings</small>
            </div>
            <ChevronRight className="dashboard-action-chevron" aria-hidden="true" />
          </Link>
          <Link to="/admin/employees">
            <UserRoundCheck />
            <div>
              <strong>Employees</strong>
              <small>{employeeCount ?? "--"} active team members</small>
            </div>
            <ChevronRight className="dashboard-action-chevron" aria-hidden="true" />
          </Link>
          <Link to="/admin/services">
            <Sparkles />
            <div>
              <strong>Services</strong>
              <small>{serviceCount ?? "--"} active salon services</small>
            </div>
            <ChevronRight className="dashboard-action-chevron" aria-hidden="true" />
          </Link>
          <Link to="/admin/working-hours">
            <Clock3 />
            <div>
              <strong>Working hours</strong>
              <small>Manage weekly availability</small>
            </div>
            <ChevronRight className="dashboard-action-chevron" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  </>;
};

export default AdminDashboardPage;
