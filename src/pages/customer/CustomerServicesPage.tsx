import {
  Clock3,
  LogOut,
  Scissors,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePublicTheme } from "../../hooks/usePublicTheme";
import { getPublicServices } from "../../services/salonService";
import type { SalonService } from "../../types/service";
import CustomerBottomNav from "../../components/customer/CustomerBottomNav";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CustomerProfileModal from "../../components/customer/CustomerProfileModal";
import {
  getCustomerProfile,
  logoutCustomer,
} from "../../services/customerAuthService";
import type { Customer } from "../../types/customer";
import "./customerDashboardPage.css";
import "./customerServicesPage.css";

const CustomerServicesPage = () => {
  const navigate = useNavigate();
  const { brand, style } = usePublicTheme();
  const [services, setServices] = useState<SalonService[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => {
    Promise.allSettled([getPublicServices(), getCustomerProfile()]).then(
      ([serviceResult, profileResult]) => {
        if (serviceResult.status === "fulfilled")
          setServices(
            serviceResult.value.data.services.filter(
              (service) => service.isActive,
            ),
          );

        if (profileResult.status === "fulfilled")
          setCustomer(profileResult.value.data.customer);

        setLoading(false);
      },
    );
  }, []);
  const signOut = () => {
    logoutCustomer();
    navigate("/", { replace: true });
  };
  const visible = useMemo(
    () =>
      services.filter((service) =>
        `${service.name} ${service.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [query, services],
  );
  return (
    <main className="customer-services-page" style={style}>
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
            onClick={() => setProfileOpen(true)}
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
        </div>
      </header>
      <div className="customer-services-content">
        <section className="customer-services-heading">
          <p>Find your next look</p>
          <h1>All services</h1>
          <span>
            Explore every active service available at {brand.salonName}.
          </span>
        </section>
        <label className="customer-services-search">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services"
            aria-label="Search services"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear service search"
            >
              <X />
            </button>
          )}
        </label>
        {loading ? (
          <div className="customer-services-loading" />
        ) : visible.length ? (
          <section className="customer-services-list">
            {visible.map((service) => (
              <article key={service.id}>
                <div className="customer-services-image">
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt="" />
                  ) : (
                    <Sparkles />
                  )}
                </div>
                <div>
                  <h2>{service.name}</h2>
                  <p>{service.description}</p>
                  <footer>
                    <span>
                      <Clock3 /> {service.durationMinutes} min
                    </span>
                    <strong>{Number(service.price).toFixed(2)}</strong>
                  </footer>
                  <button className="customer-service-book" 
                  type="button" onClick={() => navigate(`/book-appointment?service=${service.id}`)}>
                    Book appointment
                    </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="customer-services-empty">
            <Search />
            <strong>No services found</strong>
            <span>Try another search term.</span>
          </div>
        )}
      </div>
      <CustomerBottomNav active="services" />
      {customer && <CustomerProfileModal open={profileOpen} initialTab="profile" customer={customer} onUpdated={setCustomer} onClose={() => setProfileOpen(false)} />}
      <ConfirmDialog
        open={logoutConfirmationOpen}
        title="Sign out?"
        message="Are you sure you want to sign out of your customer account?"
        confirmLabel="Sign out"
        onConfirm={signOut}
        onCancel={() => setLogoutConfirmationOpen(false)}
      />
    </main>
  );
};

export default CustomerServicesPage;
