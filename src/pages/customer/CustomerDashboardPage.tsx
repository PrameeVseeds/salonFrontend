import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Images,
  LogOut,
  Scissors,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CustomerProfileModal from "../../components/customer/CustomerProfileModal";
import CustomerBottomNav from "../../components/customer/CustomerBottomNav";
import { usePublicTheme } from "../../hooks/usePublicTheme";
import { getCustomerAppointments } from "../../services/appointmentService";
import {
  getCustomerProfile,
  logoutCustomer,
} from "../../services/customerAuthService";
import { getPublicServices } from "../../services/salonService";
import { getPublicGalleryImages } from "../../services/galleryService";
import type { Appointment } from "../../types/appointment";
import type { Customer } from "../../types/customer";
import type { SalonService } from "../../types/service";
import type { GalleryImage } from "../../types/gallery";
import "./customerDashboardPage.css";

const CustomerDashboardPage = () => {
  const navigate = useNavigate();
  const { brand, style } = usePublicTheme();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<SalonService[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModal, setProfileModal] = useState<
    "profile" | "password" | null
  >(null);

  useEffect(() => {
    Promise.allSettled([
      getCustomerProfile(),
      getCustomerAppointments(),
      getPublicServices(),
      getPublicGalleryImages(),
    ]).then(([profile, bookings, serviceList, galleryList]) => {
      if (profile.status === "fulfilled")
        setCustomer(profile.value.data.customer);
      if (bookings.status === "fulfilled")
        setAppointments(bookings.value.data.appointments);
      if (serviceList.status === "fulfilled")
        setServices(
          serviceList.value.data.services.filter((service) => service.isActive),
        );
      if (galleryList.status === "fulfilled")
        setGallery(
          galleryList.value.data.galleryImages
            .filter((image) => image.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder),
        );
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!window.location.hash) return;
    requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" }));
  }, []);

  const upcoming = useMemo(
    () =>
      appointments
        .filter(
          (appointment) =>
            appointment.status === "Scheduled" &&
            new Date(
              `${appointment.appointmentDate}T${appointment.startTime}`,
            ) >= new Date(),
        )
        .sort((a, b) =>
          `${a.appointmentDate}${a.startTime}`.localeCompare(
            `${b.appointmentDate}${b.startTime}`,
          ),
        ),
    [appointments],
  );

  const signOut = () => {
    logoutCustomer();
    navigate("/", { replace: true });
  };
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="customer-dashboard" style={style}>
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
            onClick={() => setProfileOpen((open) => !open)}
            aria-label="View your profile"
            aria-expanded={profileOpen}
          >
            {customer?.profileImage ? (
              <img src={customer.profileImage} alt="" />
            ) : (
              <UserRound />
            )}
          </button>
          <button
            type="button"
            onClick={() => setLogoutConfirmationOpen(true)}
            aria-label="Sign out"
          >
            <LogOut />
          </button>
          {profileOpen && (
            <section
              className="customer-profile-popover"
              aria-label="Your profile"
            >
              <button
                className="customer-profile-popover_close"
                type="button"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile"
              >
                <X />
              </button>
              <span>
                {customer?.profileImage ? (
                  <img src={customer.profileImage} alt="" />
                ) : (
                  <UserRound />
                )}
              </span>
              <div>
                <strong>
                  {customer
                    ? `${customer.firstName} ${customer.lastName}`
                    : "Your profile"}
                </strong>
                <small>{customer?.email}</small>
                <small>{customer?.phone}</small>
                <footer>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setProfileModal("profile");
                    }}
                  >
                    Edit profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setProfileModal("password");
                    }}
                  >
                    Change password
                  </button>
                </footer>
              </div>
            </section>
          )}
        </div>
      </header>

      <div className="customer-dashboard_content">
        <section className="customer-dashboard_welcome">
          <p>Welcome back</p>
          <h1>
            {customer
              ? `${customer.firstName} ${customer.lastName}`
              : "Good to see you"}
          </h1>
          <span>Ready for your next fresh look?</span>
          <button type="button" onClick={() => scrollTo("services")}>
            <Sparkles />
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
          {loading ? (
            <div className="customer-dashboard_skeleton" />
          ) : upcoming.length ? (
            <div className="customer-bookings">
              {upcoming.slice(0, 3).map((appointment) => (
                <article key={appointment.id}>
                  <time>
                    <strong>
                      {new Date(
                        `${appointment.appointmentDate}T00:00`,
                      ).toLocaleDateString(undefined, { day: "2-digit" })}
                    </strong>
                    <span>
                      {new Date(
                        `${appointment.appointmentDate}T00:00`,
                      ).toLocaleDateString(undefined, { month: "short" })}
                    </span>
                  </time>
                  <div>
                    <strong>
                      {appointment.serviceName ?? "Salon appointment"}
                    </strong>
                    <span>
                      <Clock3 />
                      {appointment.startTime.slice(0, 5)} ·{" "}
                      {appointment.employeeName ?? "Any professional"}
                    </span>
                  </div>
                  <ChevronRight />
                </article>
              ))}
            </div>
          ) : (
            <div className="customer-dashboard_empty">
              <CalendarDays />
              <strong>No upcoming visits</strong>
              <span>Choose a service below when you’re ready.</span>
            </div>
          )}
        </section>

        <section className="customer-dashboard_section" id="services">
          <header>
          <div>
            <p>Made for you</p>
            <h2>Popular services</h2>
          </div>
          <Link className="customer-section-link" to="/services">See all <ChevronRight /></Link>
        </header>
          {loading ? (
            <div className="customer-dashboard_skeleton" />
          ) : (
            <div className="customer-services">
              {services.slice(0, 6).map((service) => (
                <article key={service.id}>
                  <div className="customer-service_image">
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt="" />
                    ) : (
                      <Sparkles />
                    )}
                  </div>
                  <div>
                    <strong>{service.name}</strong>
                    <span>{service.durationMinutes} min</span>
                    <b>{Number(service.price).toFixed(2)}</b>
                  </div>
                </article>
              ))}
              {!services.length && (
                <div className="customer-dashboard_empty">
                  <Sparkles />
                  <strong>Services are being prepared</strong>
                  <span>Please check again soon.</span>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="customer-dashboard_section" id="gallery">
          <header>
            <div>
              <p>Our work</p>
              <h2>Style gallery</h2>
            </div>
            <Link className="customer-section-link" to="/gallery">See all <ChevronRight /></Link>
          </header>
          {loading ? (
            <div className="customer-dashboard_skeleton" />
          ) : gallery.length ? (
            <div className="customer-gallery-grid">
              {gallery.slice(0, 6).map((image) => (
                <figure key={image.id}>
                  <img src={image.imageUrl} alt={image.title} loading="lazy" />
                  <figcaption>{image.title}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="customer-dashboard_empty">
              <Images />
              <strong>Gallery is being prepared</strong>
              <span>Fresh looks will appear here soon.</span>
            </div>
          )}
        </section>
      </div>

      <CustomerBottomNav active="home" />
      <ConfirmDialog
        open={logoutConfirmationOpen}
        title="Sign out?"
        message="Are you sure you want to sign out of your customer account?"
        confirmLabel="Sign out"
        onConfirm={signOut}
        onCancel={() => setLogoutConfirmationOpen(false)}
      />
      {customer && profileModal && (
        <CustomerProfileModal
          open
          initialTab={profileModal}
          customer={customer}
          onUpdated={setCustomer}
          onClose={() => setProfileModal(null)}
        />
      )}
    </main>
  );
};

export default CustomerDashboardPage;
