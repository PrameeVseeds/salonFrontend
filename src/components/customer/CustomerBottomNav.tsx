import { CalendarDays, Home, Images, Scissors, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const CustomerBottomNav = ({
  active,
}: {
  active: "home" | "bookings" | "services" | "gallery" | "consultation";
}) => (
  <nav className="customer-bottom-nav" aria-label="Customer navigation">
    <NavLink className={active === "home" ? "is-active" : ""} to="/dashboard">
      <Home />
      <span>Home</span>
    </NavLink>
    <NavLink
      className={active === "bookings" ? "is-active" : ""}
      to="/appointments"
    >
      <CalendarDays />
      <span>Bookings</span>
    </NavLink>
    <NavLink
      className={active === "services" ? "is-active" : ""}
      to="/services"
    >
      <Sparkles />
      <span>Services</span>
    </NavLink>
    <NavLink
      className={active === "gallery" ? "is-active" : ""}
      to="/gallery"
    >
      <Images />
      <span>Gallery</span>
    </NavLink>
    <NavLink className={active === "consultation" ? "is-active" : ""} to="/ai-consultation">
      <Scissors />
      <span>AI style</span>
    </NavLink>
  </nav>
);

export default CustomerBottomNav;
