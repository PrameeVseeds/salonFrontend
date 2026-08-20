import type { Appointment, AppointmentStatus } from "../../types/appointment";

interface DashboardOperationsChartsProps {
  appointments: Appointment[];
  loading: boolean;
}

const statusOrder: AppointmentStatus[] = ["Scheduled", "In Progress", "Completed", "Cancelled"];

const localDate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const DashboardOperationsCharts = ({ appointments, loading }: DashboardOperationsChartsProps) => {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = localDate(date);
    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      count: appointments.filter((appointment) => appointment.appointmentDate === key).length,
    };
  });
  const maximum = Math.max(...days.map((day) => day.count), 1);
  const completedValue = appointments
    .filter((appointment) => appointment.status === "Completed")
    .reduce((total, appointment) => total + Number(appointment.totalAmount), 0);

  return (
    <section className="dashboard-insights" aria-label="Operational charts">
      <article className="dashboard-chart-card">
        <header>
          <div>
            <h2>Appointment trend</h2>
            <p>Bookings across the last seven days</p>
          </div>
          <strong>{loading ? "--" : appointments.length}</strong>
        </header>
        <div className="dashboard-bar-chart">
          {days.map((day) =>
            <div key={day.key} className="dashboard-bar-column">
              <span>{loading ? "–" : day.count}</span>
              <div>
                <i style={{ height: loading ? "8%" : `${Math.max((day.count / maximum) * 100, day.count ? 12 : 4)}%` }} />
              </div>
              <small>{day.label}</small>
            </div>)}
        </div>
      </article>
      <article className="dashboard-chart-card">
        <header>
          <div>
            <h2>Appointment status</h2>
            <p>Current operational distribution</p>
          </div>
          <div className="dashboard-revenue">
            <span>Completed value</span>
            <strong>{loading ? "--" : completedValue.toFixed(2)}</strong>
          </div>
        </header>
        <div className="dashboard-status-chart">
          {statusOrder.map((status) => {
            const count = appointments.filter((appointment) => appointment.status === status).length;
            const percentage = appointments.length ? (count / appointments.length) * 100 : 0;
            const className = `is-${status.toLowerCase().replace(" ", "-")}`;
            return <div key={status}>
              <span>
                <b className={className} />
                {status}
              </span>
              <div>
                <i className={className} style={{ width: `${percentage}%` }} />
              </div>
              <strong>{loading ? "–" : count}</strong>
            </div>;
          })}
        </div>
      </article>
    </section>
  );
};

export default DashboardOperationsCharts;
