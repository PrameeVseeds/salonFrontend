import { Check, Clock3, Plus, Trash2 } from "lucide-react";
import type { SalonService } from "../../../types/service";

interface EmployeeServiceCardProps {
  service: SalonService;
  assigned: boolean;
  busy: boolean;
  onAssign: (service: SalonService) => void;
  onRemove: (service: SalonService) => void;
}

const EmployeeServiceCard = ({ service, assigned, busy, onAssign, onRemove }: EmployeeServiceCardProps) => (
  <article
    className={`assignment-service-card${assigned ? " is-assigned" : ""}`}>
    <div className="assignment-service-card__image">
      <img src={service.imageUrl} alt="" />
      {assigned && (
        <span>
          <Check />
          Assigned
        </span>
      )}
    </div>
    <div className="assignment-service-card__body">
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      <div className="assignment-service-card__meta">
        <span>
          <Clock3 />
          {service.durationMinutes} min
        </span>
        <strong>Rs. {Number(service.price).toFixed(2)}</strong>
      </div>
      {assigned ? (
        <button
          className="is-remove"
          disabled={busy}
          onClick={() => onRemove(service)}>
          <Trash2 />
          Remove
        </button>
      ) : (
        <button
          disabled={busy || !service.isActive}
          onClick={() => onAssign(service)}>
          <Plus />
          Assign service
        </button>
      )}
    </div>
  </article>
);

export default EmployeeServiceCard;
