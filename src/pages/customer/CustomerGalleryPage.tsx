import { Images, LogOut, Scissors, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CustomerBottomNav from "../../components/customer/CustomerBottomNav";
import { usePublicTheme } from "../../hooks/usePublicTheme";
import {getCustomerProfile,logoutCustomer,} from "../../services/customerAuthService";
import { getPublicGalleryImages } from "../../services/galleryService";
import type { Customer } from "../../types/customer";
import type { GalleryImage } from "../../types/gallery";
import "./customerDashboardPage.css";
import "./customerGalleryPage.css";

const CustomerGalleryPage = () => {
  const navigate = useNavigate();
  const { brand, style } = usePublicTheme();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    Promise.allSettled([getPublicGalleryImages(), getCustomerProfile()]).then(
      ([galleryResult, profileResult]) => {
        if (galleryResult.status === "fulfilled")
          setImages(
            galleryResult.value.data.galleryImages
              .filter((image) => image.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder),
          );
        if (profileResult.status === "fulfilled")
          setCustomer(profileResult.value.data.customer);
        setLoading(false);
      },
    );
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          images
            .map((image) => image.category)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    ],
    [images],
  );
  const visible =
    category === "All"
      ? images
      : images.filter((image) => image.category === category);
  const signOut = () => {
    logoutCustomer();
    navigate("/", { replace: true });
  };

  return (
    <main className="customer-gallery-page" style={style}>
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
            onClick={() => navigate("/dashboard")}
            aria-label="View your profile"
          >
            {customer?.profileImage ? (
              <img src={customer.profileImage} alt="" />
            ) : (
              <UserRound />
            )}
          </button>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            aria-label="Sign out"
          >
            <LogOut />
          </button>
        </div>
      </header>
      <div className="customer-gallery-content">
        <section className="customer-gallery-heading">
          <p>Our work</p>
          <h1>Style gallery</h1>
          <span>Browse recent cuts, styling, and transformations.</span>
        </section>
        {categories.length > 1 && (
          <nav
            className="customer-gallery-filters"
            aria-label="Gallery categories"
          >
            {categories.map((item) => (
              <button
                className={category === item ? "is-active" : ""}
                type="button"
                key={item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </nav>
        )}
        {loading ? (
          <div className="customer-gallery-loading" />
        ) : visible.length ? (
          <section className="customer-gallery-masonry">
            {visible.map((image) => (
              <button
                type="button"
                key={image.id}
                onClick={() => setSelected(image)}
              >
                <img src={image.imageUrl} alt={image.title} loading="lazy" />
                <span>{image.title}</span>
              </button>
            ))}
          </section>
        ) : (
          <div className="customer-gallery-empty">
            <Images />
            <strong>No gallery images yet</strong>
            <span>Fresh looks will appear here soon.</span>
          </div>
        )}
      </div>
      <CustomerBottomNav active="gallery" />
      {selected && (
        <div
          className="customer-gallery-viewer"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close image"
          >
            <X />
          </button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img src={selected.imageUrl} alt={selected.title} />
            <figcaption>
              {selected.title}
              {selected.category && <span>{selected.category}</span>}
            </figcaption>
          </figure>
        </div>
      )}
      <ConfirmDialog
        open={logoutOpen}
        title="Sign out?"
        message="Are you sure you want to sign out of your customer account?"
        confirmLabel="Sign out"
        onConfirm={signOut}
        onCancel={() => setLogoutOpen(false)}
      />
    </main>
  );
};

export default CustomerGalleryPage;
