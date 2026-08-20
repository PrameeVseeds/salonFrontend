import { ImagePlus, X } from "lucide-react";
import type { FormEvent } from "react";
import RequiredFieldLabel from "../../common/RequiredFieldLabel";
import type { GalleryCategory } from "../../../types/gallery";
interface Props {
  editing: boolean;
  title: string;
  categoryId: string;
  categories: GalleryCategory[];
  displayOrder: string;
  isActive: boolean;
  preview: string;
  file: File | null;
  touched: Record<string, boolean>;
  errors: Record<string, string | undefined>;
  busy: boolean;
  apiError: string | null;
  onTitle: (v: string) => void;
  onCategory: (v: string) => void;
  onOrder: (v: string) => void;
  onActive: (v: boolean) => void;
  onFile: (file: File | null) => void;
  onTouch: (field: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}
const GalleryImageModal = (props: Props) => (
  <div
    className="gallery-modal"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) props.onClose();
    }}
  >
    <section role="dialog" aria-modal="true">
      <header>
        <div>
          <h2>{props.editing ? "Edit gallery image" : "Add gallery image"}</h2>
          <p>Required fields are marked below.</p>
        </div>
        <button onClick={props.onClose} aria-label="Close">
          <X />
        </button>
      </header>
      <form noValidate onSubmit={props.onSubmit}>
        <label>
          <RequiredFieldLabel>Title</RequiredFieldLabel>
          <input
            value={props.title}
            maxLength={150}
            onChange={(e) => props.onTitle(e.target.value)}
            onBlur={() => props.onTouch("title")}
            aria-invalid={Boolean(props.touched.title && props.errors.title)}
          />
          {props.touched.title && props.errors.title && (
            <small>{props.errors.title}</small>
          )}
        </label>
        <label>
          <span>
            Category <small>Optional</small>
          </span>
          <select
            value={props.categoryId}
            onChange={(e) => props.onCategory(e.target.value)}
          >
            <option value="">No category</option>
            {props.categories
              .filter(
                (category) =>
                  category.isActive || String(category.id) === props.categoryId,
              )
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </label>
        <label>
          <RequiredFieldLabel>Display order</RequiredFieldLabel>
          <input
            type="number"
            min="0"
            step="1"
            value={props.displayOrder}
            onChange={(e) => props.onOrder(e.target.value)}
            onBlur={() => props.onTouch("order")}
            aria-invalid={Boolean(props.touched.order && props.errors.order)}
          />
          {props.touched.order && props.errors.order && (
            <small>{props.errors.order}</small>
          )}
        </label>
        <label className="gallery-active">
          <input
            type="checkbox"
            checked={props.isActive}
            onChange={(e) => props.onActive(e.target.checked)}
          />
          Visible in public gallery
        </label>
        <label className="gallery-picker">
          {props.editing ? (
            <span>
              Replacement image <small>Optional</small>
            </span>
          ) : (
            <RequiredFieldLabel>Gallery image</RequiredFieldLabel>
          )}
          <span>
            {props.preview ? (
              <img src={props.preview} alt="Selected preview" />
            ) : (
              <ImagePlus />
            )}
            <strong>
              {props.file?.name ??
                (props.editing
                  ? "Choose a new image (optional)"
                  : "Choose image")}
            </strong>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => props.onFile(e.target.files?.[0] ?? null)}
              onBlur={() => props.onTouch("image")}
            />
          </span>
          <em>JPG, PNG or WEBP, up to 5 MB</em>
          {props.touched.image && props.errors.image && (
            <small>{props.errors.image}</small>
          )}
        </label>
        {props.apiError && (
          <p className="gallery-message is-error">{props.apiError}</p>
        )}
        <footer>
          <button type="button" onClick={props.onClose}>
            Cancel
          </button>
          <button className="is-primary" disabled={props.busy}>
            {props.busy ? "Saving..." : "Save image"}
          </button>
        </footer>
      </form>
    </section>
  </div>
);
export default GalleryImageModal;
