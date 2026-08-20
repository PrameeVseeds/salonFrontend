import { useEffect, useState } from "react";
import { Settings2, ShieldCheck, UserRoundCog } from "lucide-react";
import { getAdmins } from "../../services/adminService";
import type { Admin } from "../../types/admin";

interface SuperAdminDashboardPageProps {
  user: Admin;
}

const SuperAdminDashboardPage = ({ user }: SuperAdminDashboardPageProps) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAdmins()
      .then(({ data }) => {
        if (active) setAdmins(data);
      })
      .catch(() => undefined)
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
      <section className="dashboard-stats" aria-label="Administrator summary">
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
      <section>
        <div className="dashboard-section-heading">
          <div>
            <h2>Administration</h2>
            <p>Super-admin capabilities for managing the platform.</p>
          </div>
        </div>
        <div className="dashboard-card-grid dashboard-card-grid--three">
          <article className="dashboard-card">
            <span className="dashboard-card_icon">
              <UserRoundCog aria-hidden="true" />
            </span>
            <h3>Admin accounts</h3>
            <p>Create administrators, update access, and reset passwords.</p>
            <small>Account management</small>
          </article>
          <article className="dashboard-card">
            <span className="dashboard-card_icon">
              <Settings2 aria-hidden="true" />
            </span>
            <h3>Salon settings</h3>
            <p>Control global business information and theme settings.</p>
            <small>System configuration</small>
          </article>
          <article className="dashboard-card">
            <span className="dashboard-card_icon">
              <ShieldCheck aria-hidden="true" />
            </span>
            <h3>Full operations</h3>
            <p>
              Access every appointment, customer, employee, and service module.
            </p>
            <small>Complete access</small>
          </article>
        </div>
      </section>
    </>
  );
};

export default SuperAdminDashboardPage;
