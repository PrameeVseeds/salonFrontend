import { CalendarDays, ChevronRight, Clock3, Home, LogOut, Scissors, Sparkles, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePublicTheme } from "../../hooks/usePublicTheme";
import { getCustomerAppointments } from "../../services/appointmentService";
import { getCustomerProfile, logoutCustomer } from "../../services/customerAuthService";
import { getPublicServices } from "../../services/salonService";
import type { Appointment } from "../../types/appointment";
import type { Customer } from "../../types/customer";
import type { SalonService } from "../../types/service";
import "./customerDashboardPage.css";

const CustomerDashboardPage = () => {
  const navigate = useNavigate();
  const { brand, style } = usePublicTheme();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getCustomerProfile(), getCustomerAppointments(), getPublicServices()]).then(([profile, bookings, serviceList]) => {
      if (profile.status === "fulfilled")
        setCustomer(profile.value.data.customer);
      if (bookings.status === "fulfilled")
        setAppointments(bookings.value.data.appointments);
      if (serviceList.status === "fulfilled")
        setServices(serviceList.value.data.services.filter((service) => service.isActive));
      setLoading(false);
    });
  }, []);

  const upcoming = useMemo(() => appointments
    .filter((appointment) => appointment.status === "Scheduled" && new Date(`${appointment.appointmentDate}T${appointment.startTime}`) >= new Date())
    .sort((a, b) => `${a.appointmentDate}${a.startTime}`
      .localeCompare(`${b.appointmentDate}${b.startTime}`)), [appointments]);

  const signOut = () => { logoutCustomer(); navigate("/", { replace: true }); };
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return <main className="customer-dashboard" style={style}>
    <header className="customer-dashboard_header">
      <div className="customer-dashboard_brand">
        <span>{brand.logoUrl ? <img src={brand.logoUrl} alt={`${brand.salonName} logo`} /> : <Scissors />}</span>
        <strong>{brand.salonName}</strong>
      </div>
      <button type="button" onClick={signOut} aria-label="Sign out">
        <LogOut />
      </button>
    </header>

    <div className="customer-dashboard_content">
      <section className="customer-dashboard_welcome">
        <p>Welcome back</p>
        <h1>{customer ? `${customer.firstName} 👋` : "Good to see you"}</h1>
        <span>Ready for your next fresh look?</span>
        <button type="button" onClick={() => scrollTo("services")}>
          <CalendarDays />
          Explore services
        </button>
      </section>

      <section className="customer-dashboard_section" id="appointments">
        <header>
          <div>
            <p>Your schedule</p>
            <h2>Upcoming appointments</h2>
          </div>
          <span>{upcoming.length}</span>
        </header>
        {loading ?
          <div className="customer-dashboard_skeleton" />
          : upcoming.length ?
            <div className="customer-bookings">
              {upcoming.slice(0, 3).map((appointment) => <article key={appointment.id}>
                <time>
                  <strong>{new Date(`${appointment.appointmentDate}T00:00`).toLocaleDateString(undefined, { day: "2-digit" })}</strong>
                  <span>{new Date(`${appointment.appointmentDate}T00:00`).toLocaleDateString(undefined, { month: "short" })}</span>
                </time>
                <div>
                  <strong>{appointment.serviceName ?? "Salon appointment"}</strong>
                  <span>
                    <Clock3 />
                    {appointment.startTime.slice(0, 5)} · {appointment.employeeName ?? "Any professional"}</span>
                </div>
                <ChevronRight />
              </article>)}
            </div> :
            <div className="customer-dashboard_empty">
              <CalendarDays />
              <strong>No upcoming visits</strong>
              <span>Choose a service below when you’re ready.</span>
            </div>}
      </section>

      <section className="customer-dashboard_section" id="services">
        <header>
          <div>
            <p>Made for you</p>
            <h2>Popular services</h2>
          </div>
        </header>
        {loading ? <div className="customer-dashboard_skeleton" /> : <div className="customer-services">
          {services.slice(0, 6).map((service) => <article key={service.id}>
            <div className="customer-service_image">{service.imageUrl ? <img src={service.imageUrl} alt="" /> : <Sparkles />}</div>
            <div>
              <strong>{service.name}
              </strong>
              <span>{service.durationMinutes} min
              </span>
              <b>{Number(service.price).toFixed(2)}</b>
            </div>
          </article>)}
          {!services.length &&
            <div className="customer-dashboard_empty">
              <Sparkles />
              <strong>
                Services are being prepared
              </strong>
              <span>Please check again soon.</span>
            </div>}
        </div>}
      </section>

      <section className="customer-dashboard_profile" id="profile">
        <span>{customer?.profileImage ? <img src={customer.profileImage} alt="" /> : <UserRound />}</span>
        <div>
          <strong>{customer ? `${customer.firstName} ${customer.lastName}` : "Your profile"}</strong>
          <small>{customer?.email}</small>
        </div>
      </section>
    </div>

    <nav className="customer-bottom-nav" aria-label="Customer navigation">
      <button className="is-active" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <Home />
        <span>Home</span>
      </button>
      <button type="button" onClick={() => scrollTo("appointments")}>
        <CalendarDays />
        <span>Bookings</span></button>
      <button type="button" onClick={() => scrollTo("services")}>
        <Sparkles />
        <span>Services</span></button>
      <button type="button" onClick={() => scrollTo("profile")}>
        <UserRound />
        <span>Profile</span>
      </button>
    </nav>
  </main>;
};

export default CustomerDashboardPage;
