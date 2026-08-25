import { Bell, CheckCircle2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCustomerNotifications } from "../../services/notificationService";
import type { AdminNotification } from "../../types/notification";
import "./customerNotificationBell.css";

const READ_KEY = "customer-read-notification-ids";

const readableMessage = (message: string) => message
  .replace(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+GMT[+-]\d{4}\s+\([^)]*\)/g, (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ?
      value : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  })
  .replace(/\b(\d{2}:\d{2}):\d{2}(?:\.\d+)?\b/g, "$1");

const CustomerNotificationBell = () => {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<number>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(READ_KEY) ?? "[]");
      return new Set(Array.isArray(stored) ? stored.filter(Number.isInteger) : []);
    } catch {
      return new Set();
    }
  });
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());
  const root = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const { data } = await getCustomerNotifications();
      setItems(data.notifications);
      setError(null);
    } catch {
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const unread = items.filter((item) => !readIds.has(item.id)).length;
  const toggle = () => {
    setOpen((current) => {
      const next = !current;
      if (next && items.length) {
        setHighlightedIds(new Set(items.filter((item) => !readIds.has(item.id)).map((item) => item.id)));
        const updated = new Set(readIds);
        items.forEach((item) => updated.add(item.id));
        setReadIds(updated);
        localStorage.setItem(READ_KEY, JSON.stringify([...updated]));
      } else if (!next) setHighlightedIds(new Set());
      return next;
    });
  };

  return (
    <div className="customer-notification" ref={root}>
      <button type="button" className="customer-notification_trigger" onClick={toggle} aria-label={`${unread} unread notifications`} aria-expanded={open}>
        <Bell />
        {unread > 0 && <span>{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <section className="customer-notification_popover">
          <header>
            <div>
              <h2>Notifications</h2>
              <p>{unread ? `${unread} new` : "You're all caught up"}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications">
              <X />
            </button>
          </header>
          <div className="customer-notification_list">
            {loading ? <p>Loading notifications...</p>
              : error && !items.length ? <p className="is-error">{error}</p>
                : items.length ? items.slice(0, 10).map((item) => (
                  <article key={item.id} className={highlightedIds.has(item.id) ? "is-new" : undefined}>
                    <span><CheckCircle2 /></span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{readableMessage(item.message)}</p>
                      <small>
                        {new Date(item.createdAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </small>
                    </div>
                  </article>
                )) : <p>No notifications yet.</p>}
          </div>
        </section>
      )}
    </div>
  );
};

export default CustomerNotificationBell;
