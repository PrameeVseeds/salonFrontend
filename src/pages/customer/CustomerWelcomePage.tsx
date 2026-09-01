import {
  Download,
  Mail,
  MapPin,
  Menu,
  Phone,
  Scissors,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import fallbackHero from "../../assets/hero.png";
import { usePublicTheme } from "../../hooks/usePublicTheme";
import { getPublicGalleryImages } from "../../services/galleryService";
import { getPublicServices } from "../../services/salonService";
import { getPublicSalonSettings } from "../../services/settingsService";
import type { GalleryImage } from "../../types/gallery";
import type { SalonService } from "../../types/service";
import type { SalonSettings } from "../../types/settings";
import { hasCustomerToken } from "../../utils/customerToken";
import { getGoogleMapsEmbedUrl } from "../../utils/googleMaps";
import {
  getPwaInstallPrompt,
  setPwaInstallPrompt,
  subscribeToPwaInstallPrompt,
  type PwaInstallPrompt,
} from "../../utils/pwaInstall";
import "./customerWelcomePage.css";

const isInstalledApp = () =>
  window.matchMedia("(display-mode: standalone), (display-mode: fullscreen)")
    .matches ||
  ("standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

const CustomerWelcomePage = () => {
  const { theme, brand, style } = usePublicTheme();
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [services, setServices] = useState<SalonService[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPromptState] =
    useState<PwaInstallPrompt | null>(getPwaInstallPrompt());
  const [installHelp, setInstallHelp] = useState("");
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const standalone = isInstalledApp();
  const salonName = settings?.salonName || brand.salonName;

  useEffect(() => {
    Promise.allSettled([
      getPublicSalonSettings(),
      getPublicServices(),
      getPublicGalleryImages(),
    ]).then(([settingsResult, servicesResult, galleryResult]) => {
      if (settingsResult.status === "fulfilled")
        setSettings(settingsResult.value.data.settings);
      if (servicesResult.status === "fulfilled")
        setServices(
          servicesResult.value.data.services.filter((item) => item.isActive && item.categoryIsActive),
        );
      if (galleryResult.status === "fulfilled")
        setGallery(
          galleryResult.value.data.galleryImages.filter(
            (item) => item.isActive,
          ),
        );
    });
    return subscribeToPwaInstallPrompt(setInstallPromptState);
  }, []);

  if (standalone)
    return (
      <Navigate to={hasCustomerToken() ? "/dashboard" : "/login"} replace />
    );

  const install = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setPwaInstallPrompt(null);
        setInstallPromptState(null);
      }
      return;
    }

    setInstallHelp(
      /iphone|ipad|ipod/i.test(navigator.userAgent)
        ? "In Safari, tap Share and then Add to Home Screen."
        : "Open your browser menu and choose Install app or Add to Home screen.",
    );
  };

  const closeMenu = () => setMenuOpen(false);
  const openInstallModal = () => {
    setInstallHelp("");
    setMenuOpen(false);
    setInstallModalOpen(true);
  };
  const mapEmbedUrl = settings
    ? getGoogleMapsEmbedUrl(settings.mapUrl, settings.address)
    : null;
  const heroImage = theme.heroMediaUrl || fallbackHero;

  return (
    <main className="welcome-site" style={style}>
      <header className="welcome-header">
        <a className="welcome-logo" href="#home" onClick={closeMenu}>
          <span>
            {brand.logoUrl ? <img src={brand.logoUrl} alt="" /> : <Scissors />}
          </span>
          {salonName}
        </a>
        <button
          className="welcome-menu-button"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? "is-open" : ""} aria-label="Main navigation">
          <a href="#home" onClick={closeMenu}>
            Home
          </a>
          <a href="#gallery" onClick={closeMenu}>
            Gallery
          </a>
          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>
          <button type="button" onClick={openInstallModal}>
            Install app
          </button>
        </nav>
      </header>

      <section className="welcome-hero" id="home">
        {theme.heroMediaUrl && theme.heroMediaType === "Video" ? (
          <video src={theme.heroMediaUrl} autoPlay muted loop playsInline />
        ) : (
          <img src={heroImage} alt={`${salonName} salon`} />
        )}
        <div className="welcome-hero-shade" />
        <div className="welcome-hero-copy">
          <p>Welcome to {salonName}</p>
          <h1>
            Beauty, crafted   just for you.

          </h1>
          <span>
            Relax, refresh, and discover a look that makes you feel completely
            yourself.
          </span>
          <button type="button" onClick={openInstallModal}>
            <Download /> Install app
          </button>
          {installHelp && <small role="status">{installHelp}</small>}
        </div>
      </section>

      {installModalOpen && (
        <div className="welcome-install-modal-backdrop" role="presentation" onMouseDown={() => setInstallModalOpen(false)}>
          <section className="welcome-install-modal" role="dialog" aria-modal="true" aria-labelledby="install-app-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="welcome-install-close" type="button" aria-label="Close install dialog" onClick={() => setInstallModalOpen(false)}><X /></button>
            <p className="welcome-install-eyebrow">Your salon, one tap away</p>
            <h2 id="install-app-title">Install {salonName}</h2>
            <p className="welcome-install-description">Book services and manage your appointments from a beautiful app on your device.</p>
            <div className="welcome-install-app-info">
              <span><img src="/pwa-icon-192.png" alt="" /></span>
              <div><strong>{salonName}</strong><small>Safe, fast and easy to access</small></div>
            </div>
            <div className="welcome-install-modal-actions">
              <button type="button" className="is-cancel" onClick={() => setInstallModalOpen(false)}>Cancel</button>
              <button type="button" className="is-install" onClick={() => { setInstallModalOpen(false); void install(); }}><Download /> Install app</button>
            </div>
          </section>
        </div>
      )}

      <section className="welcome-gallery welcome-section" id="gallery">
        <div className="welcome-section-heading">
          <p className="welcome-eyebrow">Our work</p>
          <h2>Gallery</h2>
          <span>A glimpse of the looks and moments created in our salon.</span>
        </div>
        <div className="welcome-gallery-grid">
          {gallery.length ? (
            gallery.slice(0, 8).map((image) => (
              <figure key={image.id}>
                <img src={image.imageUrl} alt={image.title} loading="lazy" />
                <figcaption>{image.title}</figcaption>
              </figure>
            ))
          ) : (
            <div className="welcome-gallery-placeholder">
              <Scissors />
              <span>Our gallery is coming soon.</span>
            </div>
          )}
        </div>
      </section>

      <section className="welcome-contact welcome-section" id="contact">
        <div className="welcome-contact-copy">
          <p className="welcome-eyebrow">Get in touch</p>
          <h2>We would love to hear from you</h2>
          <p>
            Have a question about a service or need help with the app? Contact
            our team and we’ll be happy to help.
          </p>
          <address>
            {settings?.address && (
              <span>
                <MapPin />
                <span>{settings.address}</span>
              </span>
            )}
            {settings?.phone && (
              <a href={`tel:${settings.phone}`}>
                <Phone />
                <span>{settings.phone}</span>
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`}>
                <Mail />
                <span>{settings.email}</span>
              </a>
            )}
          </address>
        </div>
        {mapEmbedUrl && (
          <div className="welcome-map">
            <iframe
              title={`${salonName} location`}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </section>

      <footer className="welcome-footer">
        <div className="welcome-footer-main">
          <div className="welcome-footer-brand">
            <a className="welcome-logo" href="#home">
              <span>
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt="" />
                ) : (
                  <Scissors />
                )}
              </span>
              {salonName}
            </a>
            <strong>Look Great. Feel Confident.</strong>
            <p>
              We are passionate about helping you look and feel your best every
              day.
            </p>
            <div className="welcome-socials">
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M13.8 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5H17V3.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4v2.3H8.3V13H11v8h2.8Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <div className="welcome-footer-links">
            <h3>Quick Links</h3>
            <a href="#home">Home</a>
            <a href="#about">About Us</a>
            <a href="#services">Services</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact Us</a>
          </div>
          <div className="welcome-footer-links">
            <h3>Our Services</h3>
            {services.slice(0, 5).map((service) => (
              <a key={service.id} href="#services">
                {service.name}
              </a>
            ))}
          </div>
          <div className="welcome-footer-links welcome-footer-contact">
            <h3>Contact Info</h3>
            {settings?.phone && (
              <a href={`tel:${settings.phone}`}>
                <Phone />
                {settings.phone}
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`}>
                <Mail />
                {settings.email}
              </a>
            )}
            {settings?.address && (
              <a href="#contact">
                <MapPin />
                {settings.address}
              </a>
            )}
          </div>
        </div>
        <div className="welcome-footer-bottom">
          <span>
            © {new Date().getFullYear()} {salonName}. All Rights Reserved.
          </span>
          <span>
            Developed by <a href="https://www.vseeds.lk/" target="_blank" rel="noreferrer">SEEDS PVT LTD</a>
          </span>
        </div>
      </footer>
    </main>
  );
};

export default CustomerWelcomePage;
