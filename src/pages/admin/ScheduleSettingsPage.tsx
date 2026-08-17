import axios from "axios";
import {
  Asterisk,
  CalendarOff,
  Clock3,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  createBusinessBreak,
  createClosedDate,
  deleteBusinessBreak,
  deleteClosedDate,
  getBusinessBreaks,
  getClosedDates,
  updateBusinessBreak,
  updateClosedDate,
} from "../../services/scheduleSettingsService";
import type { BusinessBreak, ClosedDate } from "../../types/scheduleSettings";
import "./scheduleSettingsPage.css";

type Modal = "break" | "closed" | null;
type Field = "date" | "startTime" | "endTime";
const errorFrom = (error: unknown) =>
  axios.isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? "Request failed.")
    : "Request failed.";
const RequiredLabel = ({ children }: { children: string }) => (
  <span className="schedule-required">
    {children}
    <Asterisk aria-label="required" />
  </span>
);
const displayDate = (date: string) =>
  new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ScheduleSettingsPage = () => {
  const [breaks, setBreaks] = useState<BusinessBreak[]>([]);
  const [closedDates, setClosedDates] = useState<ClosedDate[]>([]);
  const [modal, setModal] = useState<Modal>(null);
  const [editingBreak, setEditingBreak] = useState<BusinessBreak | null>(null);
  const [editingClosed, setEditingClosed] = useState<ClosedDate | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getBusinessBreaks(), getClosedDates()])
      .then(([breakResponse, dateResponse]) => {
        setBreaks(breakResponse.data.businessBreaks);
        setClosedDates(dateResponse.data.closedDates);
      })
      .catch((requestError) => setError(errorFrom(requestError)));
  }, []);
  const reset = () => {
    setDate("");
    setStartTime("");
    setEndTime("");
    setReason("");
    setTouched({});
    setError(null);
  };
  const openBreak = (item?: BusinessBreak) => {
    reset();
    setEditingClosed(null);
    setEditingBreak(item ?? null);
    if (item) {
      setDate(item.breakDate.slice(0, 10));
      setStartTime(item.startTime.slice(0, 5));
      setEndTime(item.endTime.slice(0, 5));
      setReason(item.reason ?? "");
    }
    setModal("break");
  };
  const openClosed = (item?: ClosedDate) => {
    reset();
    setEditingBreak(null);
    setEditingClosed(item ?? null);
    if (item) {
      setDate(item.closedDate.slice(0, 10));
      setReason(item.reason ?? "");
    }
    setModal("closed");
  };
  const close = () => {
    if (!busy) {
      setModal(null);
      setEditingBreak(null);
      setEditingClosed(null);
      reset();
    }
  };
  const errors: Partial<Record<Field, string>> = {
    date: date ? undefined : "Date is required.",
    startTime:
      modal === "break" && !startTime ? "Start time is required." : undefined,
    endTime:
      modal === "break"
        ? !endTime
          ? "End time is required."
          : startTime && endTime <= startTime
            ? "End time must be later than start time."
            : undefined
        : undefined,
  };
  const touch = (field: Field) =>
    setTouched((current) => ({ ...current, [field]: true }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const required: Field[] =
      modal === "break" ? ["date", "startTime", "endTime"] : ["date"];
    setTouched(Object.fromEntries(required.map((field) => [field, true])));
    if (required.some((field) => errors[field])) return;
    setBusy(true);
    setError(null);
    try {
      if (modal === "break") {
        const input = {
          breakDate: date,
          startTime,
          endTime,
          reason: reason.trim() || null,
        };
        const response = editingBreak
          ? await updateBusinessBreak(editingBreak.id, input)
          : await createBusinessBreak(input);
        const saved = response.data.businessBreak;
        setBreaks((current) =>
          editingBreak
            ? current.map((item) => (item.id === saved.id ? saved : item))
            : [...current, saved].sort((a, b) =>
                a.breakDate.localeCompare(b.breakDate),
              ),
        );
      }
      if (modal === "closed") {
        const input = { closedDate: date, reason: reason.trim() || null };
        const response = editingClosed
          ? await updateClosedDate(editingClosed.id, input)
          : await createClosedDate(input);
        const saved = response.data.closedDate;
        setClosedDates((current) =>
          editingClosed
            ? current.map((item) => (item.id === saved.id ? saved : item))
            : [...current, saved].sort((a, b) =>
                a.closedDate.localeCompare(b.closedDate),
              ),
        );
      }
      close();
    } catch (requestError) {
      setError(errorFrom(requestError));
    } finally {
      setBusy(false);
    }
  };
  const removeBreak = async (item: BusinessBreak) => {
    if (!window.confirm("Delete this business break?")) return;
    try {
      await deleteBusinessBreak(item.id);
      setBreaks((current) => current.filter((value) => value.id !== item.id));
    } catch (requestError) {
      setError(errorFrom(requestError));
    }
  };
  const removeClosed = async (item: ClosedDate) => {
    if (
      !window.confirm(
        `Remove ${displayDate(item.closedDate)} from closed dates?`,
      )
    )
      return;
    try {
      await deleteClosedDate(item.id);
      setClosedDates((current) =>
        current.filter((value) => value.id !== item.id),
      );
    } catch (requestError) {
      setError(errorFrom(requestError));
    }
  };

  return (
    <div className="schedule-page">
      <header>
        <p className="dashboard-eyebrow">Availability control</p>
        <h1>Business calendar</h1>
        <p>Plan business breaks and dates when the salon is closed.</p>
      </header>
      {error && !modal && <p className="schedule-message">{error}</p>}
      <div className="schedule-layout">
        <section className="schedule-card">
          <header>
            <div>
              <span>
                <Clock3 />
              </span>
              <div>
                <h2>Business breaks</h2>
                <p>Block appointment times on specific dates.</p>
              </div>
            </div>
            <button onClick={() => openBreak()}>
              <Plus />
              Add break
            </button>
          </header>
          <div className="schedule-list">
            {breaks.map((item) => (
              <article key={item.id}>
                <div className="schedule-date">
                  <strong>{displayDate(item.breakDate)}</strong>
                  <span>
                    {item.startTime.slice(0, 5)} – {item.endTime.slice(0, 5)}
                  </span>
                </div>
                <p>{item.reason || "No reason provided"}</p>
                <div className="schedule-actions">
                  <button onClick={() => openBreak(item)} title="Edit break">
                    <Pencil />
                  </button>
                  <button
                    className="is-delete"
                    onClick={() => void removeBreak(item)}
                    title="Delete break"
                  >
                    <Trash2 />
                  </button>
                </div>
              </article>
            ))}
            {breaks.length === 0 && (
              <p className="schedule-empty">No business breaks configured.</p>
            )}
          </div>
        </section>
        <section className="schedule-card">
          <header>
            <div>
              <span>
                <CalendarOff />
              </span>
              <div>
                <h2>Closed dates</h2>
                <p>Block bookings for complete days.</p>
              </div>
            </div>
            <button onClick={() => openClosed()}>
              <Plus />
              Add date
            </button>
          </header>
          <div className="schedule-list">
            {closedDates.map((item) => (
              <article key={item.id}>
                <div className="schedule-date">
                  <strong>{displayDate(item.closedDate)}</strong>
                  <span>Closed all day</span>
                </div>
                <p>{item.reason || "No reason provided"}</p>
                <div className="schedule-actions">
                  <button
                    onClick={() => openClosed(item)}
                    title="Edit closed date"
                  >
                    <Pencil />
                  </button>
                  <button
                    className="is-delete"
                    onClick={() => void removeClosed(item)}
                    title="Delete closed date"
                  >
                    <Trash2 />
                  </button>
                </div>
              </article>
            ))}
            {closedDates.length === 0 && (
              <p className="schedule-empty">No closed dates configured.</p>
            )}
          </div>
        </section>
      </div>
      {modal && (
        <div
          className="schedule-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section role="dialog" aria-modal="true">
            <header>
              <div>
                <h2>
                  {modal === "break"
                    ? `${editingBreak ? "Edit" : "Add"} business break`
                    : `${editingClosed ? "Edit" : "Add"} closed date`}
                </h2>
                <p>Required fields are marked below.</p>
              </div>
              <button onClick={close} aria-label="Close">
                <X />
              </button>
            </header>
            <form noValidate onSubmit={(event) => void submit(event)}>
              <label>
                <RequiredLabel>Date</RequiredLabel>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  onBlur={() => touch("date")}
                  aria-invalid={Boolean(touched.date && errors.date)}
                />
                {touched.date && errors.date && <small>{errors.date}</small>}
              </label>
              {modal === "break" && (
                <>
                  <label>
                    <RequiredLabel>Start time</RequiredLabel>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      onBlur={() => touch("startTime")}
                      aria-invalid={Boolean(
                        touched.startTime && errors.startTime,
                      )}
                    />
                    {touched.startTime && errors.startTime && (
                      <small>{errors.startTime}</small>
                    )}
                  </label>
                  <label>
                    <RequiredLabel>End time</RequiredLabel>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      onBlur={() => touch("endTime")}
                      aria-invalid={Boolean(touched.endTime && errors.endTime)}
                    />
                    {touched.endTime && errors.endTime && (
                      <small>{errors.endTime}</small>
                    )}
                  </label>
                </>
              )}
              <label className="is-wide">
                <span>
                  Reason <small>Optional</small>
                </span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Add a short reason"
                />
              </label>
              {error && <p className="schedule-message">{error}</p>}
              <footer>
                <button type="button" onClick={close}>
                  Cancel
                </button>
                <button className="is-primary" disabled={busy}>
                  {busy ? "Saving..." : "Save"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
export default ScheduleSettingsPage;
