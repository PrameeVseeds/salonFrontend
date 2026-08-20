import { CheckCircle2, Clock3, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { completeAppointment, getAppointments, startAppointment } from "../../services/appointmentService";
import type { Appointment } from "../../types/appointment";
import { getApiErrorMessage } from "../../utils/apiError";
import "./appointmentManagementPage.css";

const AppointmentManagementPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => getAppointments()
    .then(({ data }) => setAppointments(data.appointments))
    .catch((requestError: unknown) => setError(getApiErrorMessage(requestError, "Unable to load appointments.")));

  useEffect(() => { void load(); }, []);

  const changeStatus = async (appointment: Appointment) => {
    setBusyId(appointment.id);
    setError(null);
    try {
      const response = appointment.status === "Scheduled"
        ? await startAppointment(appointment.id)
        : await completeAppointment(appointment.id);
      setAppointments((current) => current.map((item) =>
        item.id === appointment.id ? response.data.appointment : item,
      ));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to update appointment."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="appointment-page">
      <header>
        <p className="dashboard-eyebrow">Daily operations</p>
        <h1>Appointments</h1>
        <p>Start arrivals before their grace period expires and complete finished services.</p>
      </header>
      {error && <p className="appointment-message is-error">{error}</p>}
      <section className="appointment-card">
        <div className="appointment-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Employee</th>
                <th>Service</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.startTime.slice(0, 5)}–{appointment.endTime.slice(0, 5)}</td>
                  <td>#{appointment.customerId}</td>
                  <td>{appointment.employeeId ? `#${appointment.employeeId}` : "Unassigned"}</td>
                  <td>#{appointment.serviceId}</td>
                  <td><span className={`appointment-status is-${appointment.status.toLowerCase().replace(" ", "-")}`}>{appointment.status}</span></td>
                  <td>
                    {(appointment.status === "Scheduled" || appointment.status === "In Progress") && (
                      <button disabled={busyId === appointment.id} onClick={() => void changeStatus(appointment)}>
                        {appointment.status === "Scheduled" ? <Play /> : <CheckCircle2 />}
                        {busyId === appointment.id ? "Updating..." : appointment.status === "Scheduled" ? "Start" : "Complete"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!appointments.length && <tr><td className="appointment-empty" colSpan={7}><Clock3 />No appointments found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AppointmentManagementPage;
