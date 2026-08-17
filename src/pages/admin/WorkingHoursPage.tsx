import axios from "axios";
import { Asterisk, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import WorkingHoursRow from "../../components/admin/working-hours/WorkingHoursRow";
import {
  createWorkingHours,
  getWorkingHours,
  updateWorkingHours,
  updateWorkingHoursStatus,
} from "../../services/workingHoursService";
import type { Weekday, WorkingHoursDraft } from "../../types/workingHours";
import {
  createDefaultWorkingHours,
  getWorkingHoursErrors,
  workingHoursTouchKey,
} from "../../utils/workingHoursForm";
import "./workingHoursPage.css";

const messageFrom = (error: unknown) =>
  axios.isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? "Request failed.")
    : "Request failed.";
const WorkingHoursPage = () => {
  const [rows, setRows] = useState<WorkingHoursDraft[]>(
    createDefaultWorkingHours,
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Weekday | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => {
    getWorkingHours()
      .then(({ data }) =>
        setRows(
          createDefaultWorkingHours().map((fallback) => {
            const saved = data.workingHours.find(
              (item) => item.dayOfWeek === fallback.dayOfWeek,
            );
            return saved
              ? {
                  id: saved.id,
                  dayOfWeek: saved.dayOfWeek,
                  openingTime: saved.openingTime.slice(0, 5),
                  closingTime: saved.closingTime.slice(0, 5),
                  isClosed: saved.isClosed,
                }
              : fallback;
          }),
        ),
      )
      .catch((requestError) => setError(messageFrom(requestError)));
  }, []);
  const update = (day: Weekday, values: Partial<WorkingHoursDraft>) =>
    setRows((current) =>
      current.map((row) =>
        row.dayOfWeek === day ? { ...row, ...values } : row,
      ),
    );
  const touch = (key: string) =>
    setTouched((current) => ({ ...current, [key]: true }));
  const save = async (row: WorkingHoursDraft) => {
    const rowErrors = getWorkingHoursErrors(row);
    setTouched((current) => ({
      ...current,
      [workingHoursTouchKey(row.dayOfWeek, "opening")]: true,
      [workingHoursTouchKey(row.dayOfWeek, "closing")]: true,
    }));
    if (rowErrors.opening || rowErrors.closing) return;
    setSaving(row.dayOfWeek);
    setError(null);
    setSuccess(null);
    try {
      const input = {
        dayOfWeek: row.dayOfWeek,
        openingTime: row.openingTime,
        closingTime: row.closingTime,
        isClosed: row.isClosed,
      };
      const response = row.id
        ? await updateWorkingHours(row.id, input)
        : await createWorkingHours(input);
      const saved = response.data.workingHours;
      update(row.dayOfWeek, {
        id: saved.id,
        openingTime: saved.openingTime.slice(0, 5),
        closingTime: saved.closingTime.slice(0, 5),
        isClosed: saved.isClosed,
      });
      setSuccess(`${row.dayOfWeek} hours saved.`);
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setSaving(null);
    }
  };
  const toggle = async (row: WorkingHoursDraft) => {
    const next = !row.isClosed;
    if (!row.id) {
      update(row.dayOfWeek, { isClosed: next });
      return;
    }
    setSaving(row.dayOfWeek);
    setError(null);
    try {
      const { data } = await updateWorkingHoursStatus(row.id, next);
      update(row.dayOfWeek, { isClosed: data.workingHours.isClosed });
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setSaving(null);
    }
  };
  return (
    <div className="hours-page">
      <header>
        <p className="dashboard-eyebrow">Business availability</p>
        <h1>Salon working hours</h1>
        <p>Set opening and closing times for every day of the week.</p>
      </header>
      {error && <p className="hours-message is-error">{error}</p>}
      {success && <p className="hours-message is-success">{success}</p>}
      <section className="hours-card">
        <header>
          <div>
            <span>
              <Clock3 />
            </span>
            <div>
              <h2>Weekly schedule</h2>
              <p>Changes apply to future appointment availability.</p>
            </div>
          </div>
        </header>
        <div className="hours-labels">
          <span>Day</span>
          <span>
            Opening time <Asterisk />
          </span>
          <span>
            Closing time <Asterisk />
          </span>
          <span>Status</span>
          <span>Action</span>
        </div>
        <div className="hours-list">
          {rows.map((row) => (
            <WorkingHoursRow
              key={row.dayOfWeek}
              row={row}
              isSaving={saving === row.dayOfWeek}
              touched={touched}
              onChange={update}
              onTouch={touch}
              onToggle={(item) => void toggle(item)}
              onSave={(item) => void save(item)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
export default WorkingHoursPage;
