import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";
import "./confirmDialog.css";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({open, title, message, confirmLabel = "Confirm", busy = false, onConfirm, onCancel}: ConfirmDialogProps) => {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [busy, onCancel, open]);

  if (!open) return null;
  return (
    <div
      className="confirm-dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <button
          className="confirm-dialog_close"
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label="Close"
        >
          <X />
        </button>
        <span className="confirm-dialog_icon">
          <AlertTriangle />
        </span>
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-message">{message}</p>
        <footer>
          <button type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className="is-danger"
            type="button"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Removing..." : confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ConfirmDialog;
