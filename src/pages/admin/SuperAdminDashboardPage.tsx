import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UserRoundCog,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAdmins } from "../../services/adminService";
import { getAppointments } from "../../services/appointmentService";
import { getEmployees } from "../../services/employeeService";
import { getServices } from "../../services/salonService";
import type { Admin } from "../../types/admin";
import type { Appointment } from "../../types/appointment";
import DashboardOperationsCharts from "../../components/admin/DashboardOperationsCharts";

interface SuperAdminDashboardPageProps {
  user: Admin;
}

const SuperAdminDashboardPage = ({ user }: SuperAdminDashboardPageProps) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [activeServices, setActiveServices] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getAdmins(), getAppointments(), getEmployees(), getServices()])
      .then(
        ([
          adminResponse,
          appointmentResponse,
          employeeResponse,
          serviceResponse,
        ]) => {
          if (!active) return;
          setAdmins(adminResponse.data);
          setAppointments(appointmentResponse.data.appointments);
          setActiveEmployees(
            employeeResponse.data.employees.filter(
              (employee) => employee.isActive,
            ).length,
          );
          setActiveServices(
            serviceResponse.data.services.filter((service) => service.isActive)
              .length,
          );
        },
      )
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeAdmins = admins.filter((admin) => admin.isActive).length;

  return (
    <>
      <section className="dashboard-welcome dashboard-welcome--super">
        <div>
          <p className="dashboard-eyebrow">System control</p>
          <h1>Welcome, {user.firstName}</h1>
          <p>Oversee access, configuration, and salon operations.</p>
        </div>
        <span className="dashboard-role-badge">Super administrator</span>
      </section>
      {error && (
        <p className="dashboard-inline-error">
          Some dashboard information could not be loaded.
        </p>
      )}
      <section className="dashboard-metric-grid" aria-label="System summary">
        <article>
          <span>
            <CalendarDays />
          </span>
          <div>
            <small>All appointments</small>
            <strong>{loading ? "--" : appointments.length}</strong>
          </div>
        </article>
        <article>
          <span>
            <UserRoundCheck />
          </span>
          <div>
            <small>Active employees</small>
            <strong>{loading ? "--" : activeEmployees}</strong>
          </div>
        </article>
        <article>
          <span>
            <Sparkles />
          </span>
          <div>
            <small>Active services</small>
            <strong>{loading ? "--" : activeServices}</strong>
          </div>
        </article>
        <article>
          <span>
            <ShieldCheck />
          </span>
          <div>
            <small>Active admins</small>
            <strong>{loading ? "--" : activeAdmins}</strong>
          </div>
        </article>
      </section>
      <DashboardOperationsCharts
        appointments={appointments}
        loading={loading}
      />
      <section
        className="dashboard-stats"
        aria-label="Administrator account summary"
      >
        <article>
          <span>Total administrators</span>
          <strong>{loading ? "--" : admins.length}</strong>
          <small>Managed admin accounts</small>
        </article>
        <article>
          <span>Active administrators</span>
          <strong>{loading ? "--" : activeAdmins}</strong>
          <small>Accounts with current access</small>
        </article>
        <article>
          <span>Inactive administrators</span>
          <strong>{loading ? "--" : admins.length - activeAdmins}</strong>
          <small>Access currently disabled</small>
        </article>
      </section>
      <section className="dashboard-super-actions">
        <div className="dashboard-section-heading">
          <div>
            <h2>Quick actions</h2>
            <p>Jump directly to system and salon controls.</p>
          </div>
        </div>
        <div className="dashboard-action-list is-grid">
          <Link to="/admin/appointments">
            <CalendarDays />
            <div>
              <strong>Appointments</strong>
              <small>Monitor every booking</small>
            </div>
            <ChevronRight className="dashboard-action-chevron" aria-hidden="true" />
          </Link>
          <Link to="/super-admin/admins">
            <UserRoundCog />
            <div>
              <strong>Administrators</strong>
              <small>Manage system access</small>
            </div>
            <ChevronRight className="dashboard-action-chevron" aria-hidden="true" />
          </Link>
          <Link to="/admin/employees">
            <UserRoundCheck />
            <div>
              <strong>Employees</strong>
              <small>Manage salon team</small>
            </div>
            <ChevronRight className="dashboard-action-chevron" aria-hidden="true" />
          </Link>
          <Link to="/admin/services">
            <Sparkles />
            <div>
              <strong>Services</strong>
              <small>Manage service catalogue</small>
            </div>
            <ChevronRight className="dashboard-action-chevron" aria-hidden="true" />
          </Link>
          <Link to="/admin/working-hours">
            <Clock3 />
            <div>
              <strong>Working hours</strong>
              <small>Control availability</small>
            </div>
            <ChevronRight className="dashboard-action-chevron" aria-hidden="true" />
          </Link>
          <Link to="/super-admin/theme-settings">
            <Settings2 />
            <div>
              <strong>Theme settings</strong>
              <small>Update public appearance</small>
            </div>
            <ChevronRight className="dashboard-action-chevron" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default SuperAdminDashboardPage;
