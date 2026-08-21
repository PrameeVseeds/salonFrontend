import { Scissors } from "lucide-react";
import type { ReactNode } from "react";
import { usePublicTheme } from "../../hooks/usePublicTheme";
import "./customerAuth.css";

interface CustomerAuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

const CustomerAuthShell = ({ eyebrow, title, description, children }: CustomerAuthShellProps) => {
  const { theme, brand, style } = usePublicTheme();
  return (
    <main className="customer-auth" style={style}>
      <section className="customer-auth_visual" aria-label="Salon welcome">
        {theme.heroMediaUrl && theme.heroMediaType === "Image" && <img src={theme.heroMediaUrl} alt="" />}
        {theme.heroMediaUrl && theme.heroMediaType === "Video" && <video src={theme.heroMediaUrl} autoPlay muted loop playsInline />}
        <div className="customer-auth_visual-overlay" />
        <div className="customer-auth_brand">
          <span className={brand.logoUrl ? "has-logo" : ""}>
            {brand.logoUrl ? <img src={brand.logoUrl} alt={`${brand.salonName} logo`} /> : <Scissors aria-hidden="true" />}
          </span>
          <div>
            <strong>{brand.salonName}</strong>
            <small>Look good. Feel exceptional.</small>
          </div>
        </div>
        <div className="customer-auth_statement">
          <p>Premium care, made personal</p>
          <h2>Your next great look starts here.</h2>
          <span>Book trusted professionals at a time that works for you.</span>
        </div>
      </section>
      <section className="customer-auth_panel">
        <div className="customer-auth_card">
          <header>
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{description}</span>
          </header>
          {children}
        </div>
      </section>
    </main>
  );
};

export default CustomerAuthShell;
