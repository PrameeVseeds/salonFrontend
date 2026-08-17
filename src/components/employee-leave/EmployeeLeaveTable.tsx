import { Pencil, Trash2 } from "lucide-react";
import type { EmployeeLeave } from "../../types/employeeLeave";

interface Props {
  leaves: EmployeeLeave[];
  employeeName: (employeeId: number) => string;
  onEdit: (leave: EmployeeLeave) => void;
  onDelete: (leave: EmployeeLeave) => void;
}

const EmployeeLeaveTable = ({leaves,employeeName,onEdit,onDelete}: Props) => (
  <div className="leave-table-wrap">
    <table>
      <thead>
        <tr>
          <th>Employee</th>
          <th>Leave</th>
          <th>Date &amp; time</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leaves.map((leave) => (
          <tr key={leave.id}>
            <td>
              <strong>{employeeName(leave.employeeId)}</strong>
            </td>
            <td>
              <strong>{leave.leaveType}</strong>
              <small>{leave.reason || "No reason provided"}</small>
            </td>
            <td>
              <strong>
                {new Date(
                  `${leave.leaveDate.slice(0, 10)}T00:00:00`,
                ).toLocaleDateString()}
              </strong>
              <small>
                {leave.startTime.slice(0, 5)} – {leave.endTime.slice(0, 5)}
              </small>
            </td>
            <td>
              <span className={`is-${leave.status}`}>{leave.status}</span>
            </td>
            <td>
              <div className="leave-actions">
                <button
                  type="button"
                  onClick={() => onEdit(leave)}
                  title="Edit leave"
                  aria-label={`Edit ${employeeName(leave.employeeId)} leave`}
                >
                  <Pencil />
                </button>
                <button
                  type="button"
                  className="is-delete"
                  onClick={() => onDelete(leave)}
                  title="Delete leave"
                  aria-label={`Delete ${employeeName(leave.employeeId)} leave`}
                >
                  <Trash2 />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {leaves.length === 0 && (
      <p className="leave-empty">No leave records found.</p>
    )}
  </div>
);

export default EmployeeLeaveTable;
