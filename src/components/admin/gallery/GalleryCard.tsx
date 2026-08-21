import { Pencil, Power, Trash2 } from "lucide-react";
import type { GalleryImage } from "../../../types/gallery";
interface Props {
  image: GalleryImage;
  busy: boolean;
  onEdit: (image: GalleryImage) => void;
  onToggle: (image: GalleryImage) => void;
  onDelete: (image: GalleryImage) => void;
}
const GalleryCard = ({ image, busy, onEdit, onToggle, onDelete }: Props) => (
  <article className="gallery-card">
    <div className="gallery-card_image">
      <img src={image.imageUrl} alt={image.title} />
      <span className={image.isActive ? "is-active" : "is-inactive"}>
        {image.isActive ? "Visible" : "Hidden"}
      </span>
    </div>
    <div className="gallery-card_body">
      <div>
        <h3>{image.title}</h3>
        <p>
          {image.category || "Uncategorized"} · Order {image.displayOrder}
        </p>
      </div>
      <footer>
        <button disabled={busy} onClick={() => onEdit(image)} title="Edit">
          <Pencil />
        </button>
        <button
          disabled={busy}
          onClick={() => onToggle(image)}
          title={image.isActive ? "Hide" : "Show"}
        >
          <Power />
        </button>
        <button
          className="is-delete"
          disabled={busy}
          onClick={() => onDelete(image)}
          title="Delete"
        >
          <Trash2 />
        </button>
      </footer>
    </div>
  </article>
);
export default GalleryCard;
