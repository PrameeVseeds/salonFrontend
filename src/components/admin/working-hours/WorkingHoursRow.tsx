import { Save } from "lucide-react";
import type { Weekday, WorkingHoursDraft } from "../../../types/workingHours";
import {
  getWorkingHoursErrors,
  workingHoursTouchKey,
} from "../../../utils/workingHoursForm";

interface WorkingHoursRowProps {
  row: WorkingHoursDraft;
  isSaving: boolean;
  touched: Record<string, boolean>;
  onChange: (day: Weekday, values: Partial<WorkingHoursDraft>) => void;
  onTouch: (key: string) => void;
  onToggle: (row: WorkingHoursDraft) => void;
  onSave: (row: WorkingHoursDraft) => void;
}

const WorkingHoursRow = ({
  row,
  isSaving,
  touched,
  onChange,
  onTouch,
  onToggle,
  onSave,
}: WorkingHoursRowProps) => {
  const errors = getWorkingHoursErrors(row);
  const openingKey = workingHoursTouchKey(row.dayOfWeek, "opening");
  const closingKey = workingHoursTouchKey(row.dayOfWeek, "closing");

  return (
    <article className={row.isClosed ? "is-closed" : ""}>
      <strong>{row.dayOfWeek}</strong>
      <label>
        <span>Opening time</span>
        <input
          type="time"
          value={row.openingTime}
          disabled={row.isClosed || isSaving}
          onChange={(event) =>
            onChange(row.dayOfWeek, { openingTime: event.target.value })
          }
          onBlur={() => onTouch(openingKey)}
          aria-invalid={Boolean(touched[openingKey] && errors.opening)}
        />
        {touched[openingKey] && errors.opening && (
          <small>{errors.opening}</small>
        )}
      </label>
      <label>
        <span>Closing time</span>
        <input
          type="time"
          value={row.closingTime}
          disabled={row.isClosed || isSaving}
          onChange={(event) =>
            onChange(row.dayOfWeek, { closingTime: event.target.value })
          }
          onBlur={() => onTouch(closingKey)}
          aria-invalid={Boolean(touched[closingKey] && errors.closing)}
        />
        {touched[closingKey] && errors.closing && (
          <small>{errors.closing}</small>
        )}
      </label>
      <label className="hours-toggle">
        <input
          type="checkbox"
          checked={!row.isClosed}
          disabled={isSaving}
          onChange={() => onToggle(row)}
        />
        <span>{row.isClosed ? "Closed" : "Open"}</span>
      </label>
      <button
        className="hours-save"
        disabled={isSaving}
        onClick={() => onSave(row)}
      >
        <Save />
        {isSaving ? "Saving" : "Save"}
      </button>
    </article>
  );
};

export default WorkingHoursRow;
