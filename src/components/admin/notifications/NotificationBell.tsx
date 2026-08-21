import {
  Bell,
  Mail,
  MessageCircle,
  RefreshCw,
  Smartphone,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getAdminNotifications,
  retryAdminNotification,
} from "../../../services/notificationService";
import type { AdminNotification } from "../../../types/notification";
import "./notificationBell.css";

const typeIcon = { Email: Mail, SMS: Smartphone, WhatsApp: MessageCircle };
const NotificationBell = () => {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const { data } = await getAdminNotifications();
      setItems(data.notifications);
      setError(null);
    } catch {
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {void load();}, []);
  useEffect(() => {
    if (!open) 
      return;

    const close = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node))
        setOpen(false);
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const retry = async (item: AdminNotification) => {
    setRetrying(item.id);
    try {
      const { data } = await retryAdminNotification(item.id);
      setItems((current) =>
        current.map((value) =>
          value.id === item.id ? data.notification : value,
        ),
      );
    } 
    catch {
      setError("Notification retry failed.");
    } 
    finally {
      setRetrying(null);
    }
  };

  const attention = items.filter((item) => item.sentStatus !== "Sent").length;

  const recent = items.slice(0, 8);
  return (
    <div className="notification-bell" ref={root}>
      <button
        className="notification-bell_trigger"
        type="button"
        aria-label={`Notifications${attention ? `, ${attention} requiring attention` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell />
        {attention > 0 && <span>{attention > 99 ? "99+" : attention}</span>}
      </button>
      {open && (
        <section className="notification-popover">
          <header>
            <div>
              <h2>Notifications</h2>
              <p>
                {attention
                  ? `${attention} require attention`
                  : "All deliveries are up to date"}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
            >
              <X />
            </button>
          </header>

          <div className="notification-list">
            {loading ? (
              <p className="notification-state">Loading notifications...</p>
            ) : error && !items.length ? (
              <p className="notification-state is-error">{error}</p>
            ) : recent.length ? (
              recent.map((item) => {
                const Icon = typeIcon[item.notificationType];

                return (
                  <article key={item.id}>
                    <span
                      className={`notification-type is-${item.sentStatus.toLowerCase()}`}
                    >
                      <Icon />
                    </span>

                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.message}</p>
                      <small>
                        {item.notificationType} ·{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </small>
                    </div>

                    <span
                      className={`notification-status is-${item.sentStatus.toLowerCase()}`}
                    >
                      {item.sentStatus}
                    </span>

                    {item.sentStatus === "Failed" && (
                      <button
                        className="notification-retry"
                        type="button"
                        disabled={retrying === item.id}
                        onClick={() => void retry(item)}
                      >
                        <RefreshCw />
                        {retrying === item.id ? "Retrying" : "Retry"}
                      </button>
                    )}
                  </article>
                );
              })
            ) : (
              <p className="notification-state">No notifications yet.</p>
            )}
          </div>

          <footer>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void load();
              }}
              disabled={loading}
            >
              <RefreshCw />
              Refresh
            </button>
          </footer>
        </section>
      )}
    </div>
  );
};
export default NotificationBell;
