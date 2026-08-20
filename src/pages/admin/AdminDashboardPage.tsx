import {CalendarDays,Clock3,Sparkles,Users,type LucideIcon,} from "lucide-react";
import type { Admin } from "../../types/admin";

interface AdminDashboardPageProps {
  user: Admin;
}

const workspaces: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: CalendarDays,
    title: "Appointments",
    description: "Review bookings and keep the salon schedule organized.",
  },
  {
    icon: Users,
    title: "Customers",
    description: "Find customer profiles and manage account access.",
  },
  {
    icon: Sparkles,
    title: "Services",
    description: "Maintain salon services, availability, and assignments.",
  },
  {
    icon: Clock3,
    title: "Working hours",
    description: "Coordinate business hours, breaks, and closed dates.",
  },
];

const AdminDashboardPage = ({ user }: AdminDashboardPageProps) => (
  <>
    <section className="dashboard-welcome">
      <div>
        <p className="dashboard-eyebrow">Daily workspace</p>
        <h1>Welcome back, {user.firstName}</h1>
        <p>Manage today's salon operations from one focused workspace.</p>
      </div>
      <span className="dashboard-role-badge">Administrator</span>
    </section>
    <section aria-labelledby="workspace-heading">
      <div className="dashboard-section-heading">
        <div>
          <h2 id="workspace-heading">Your workspace</h2>
          <p>Operational areas available to salon administrators.</p>
        </div>
      </div>
      <div className="dashboard-card-grid">
        {workspaces.map(({ icon: Icon, title, description }) => (
          <article className="dashboard-card" key={title}>
            <span className="dashboard-card_icon">
              <Icon aria-hidden="true" />
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
            <small>Module coming next</small>
          </article>
        ))}
      </div>
    </section>
  </>
);

export default AdminDashboardPage;
