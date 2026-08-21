import { Mail, Send, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { sendSupportRequest } from "../../services/supportService";
import { getApiErrorMessage } from "../../utils/apiError";
import "./supportContactModal.css";

interface SupportContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportContactModal = ({ isOpen, onClose }: SupportContactModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") 
        onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) 
    return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await sendSupportRequest({
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        subject: String(formData.get("subject") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim(),
      });
      setResult({ type: "success", text: response.message });
      form.reset();
    } catch (error) {
      setResult({
        type: "error",
        text: getApiErrorMessage(
          error,
          "Unable to send your support request. Please try again.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <div
      className="support-contact-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) 
          handleClose();
      }}
    >
      <section
        className="support-contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-contact-title">

        <header className="support-contact-modal_header">
          <span className="support-contact-modal_icon">
            <Mail aria-hidden="true" />
          </span>
          <div>
            <h2 id="support-contact-title">Contact system administrator</h2>
            <p>Tell us what you need help with.</p>
          </div>
          <button
            type="button"
            aria-label="Close contact form"
            onClick={handleClose}>
            <X aria-hidden="true" />
          </button>
        </header>

        <form className="support-contact-form" onSubmit={handleSubmit}>
          <div className="support-contact-form_row">
            <label>
              <span>
                Name <b aria-hidden="true">*</b>
              </span>
              <input name="name" required maxLength={100} autoFocus />
            </label>
            <label>
              <span>
                Email address <b aria-hidden="true">*</b>
              </span>
              <input name="email" type="email" required maxLength={254} />
            </label>
          </div>
          <label>
            <span>
              Subject <b aria-hidden="true">*</b>
            </span>
            <input name="subject" required maxLength={150} />
          </label>
          <label>
            <span>
              Message <b aria-hidden="true">*</b>
            </span>
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
            />
          </label>

          {result && (
            <p
              className={`support-contact-form_message is-${result.type}`}
              role={result.type === "error" ? "alert" : "status"}
            >
              {result.text}
            </p>
          )}

          <footer>
            <button
              type="button"
              className="is-secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              <Send aria-hidden="true" />
              {isSubmitting ? "Sending..." : "Submit request"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default SupportContactModal;
