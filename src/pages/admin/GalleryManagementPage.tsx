import { Images, Plus, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import GalleryCard from "../../components/admin/gallery/GalleryCard";
import GalleryImageModal from "../../components/admin/gallery/GalleryImageModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  createGalleryImage,
  deleteGalleryImage,
  getGalleryImages,
  updateGalleryImageFile,
  updateGalleryImageStatus,
  updateGalleryMetadata,
} from "../../services/galleryService";
import { getGalleryCategories } from "../../services/galleryCategoryService";
import type { GalleryCategory, GalleryImage } from "../../types/gallery";
import { getApiErrorMessage } from "../../utils/apiError";
import "./galleryManagementPage.css";

const GalleryManagementPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [order, setOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<GalleryImage | null>(null);
  useEffect(() => {
    Promise.all([getGalleryImages(), getGalleryCategories()])
      .then(([imageResponse, categoryResponse]) => {
        setImages(imageResponse.data.galleryImages);
        setCategories(categoryResponse.data.categories);
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError)));
  }, []);
  const reset = () => {
    setTitle("");
    setCategoryId("");
    setOrder("0");
    setActive(true);
    setFile(null);
    setPreview("");
    setTouched({});
    setError(null);
  };
  const create = () => {
    setEditing(null);
    reset();
    setOpen(true);
  };
  const edit = (image: GalleryImage) => {
    setEditing(image);
    setTitle(image.title);
    setCategoryId(image.categoryId === null ? "" : String(image.categoryId));
    setOrder(String(image.displayOrder));
    setActive(image.isActive);
    setFile(null);
    setPreview(image.imageUrl);
    setTouched({});
    setError(null);
    setOpen(true);
  };
  const close = () => {
    if (!busy) {
      setOpen(false);
      setEditing(null);
      reset();
    }
  };
  const errors = {
    title: title.trim() ? undefined : "Title is required.",
    order:
      order === ""
        ? "Display order is required."
        : !Number.isInteger(Number(order)) || Number(order) < 0
          ? "Enter zero or a positive whole number."
          : undefined,
    image: !editing && !file ? "Gallery image is required." : undefined,
  };
  const choose = (selected: File | null) => {
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("Gallery image must be 5 MB or smaller.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ title: true, order: true, image: true });
    if (errors.title || errors.order || errors.image) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const input = {
        title: title.trim(),
        categoryId: categoryId ? Number(categoryId) : null,
        displayOrder: Number(order),
        isActive: active,
      };
      let saved: GalleryImage;
      if (editing) {
        const metadata = await updateGalleryMetadata(editing.id, input);
        saved = metadata.data.galleryImage;
        if (file) {
          const imageResponse = await updateGalleryImageFile(editing.id, file);
          saved = imageResponse.data.galleryImage;
        }
      } else {
        saved = (await createGalleryImage(input, file!)).data.galleryImage;
      }
      setImages((current) =>
        (editing
          ? current.map((image) => (image.id === saved.id ? saved : image))
          : [saved, ...current]
        ).sort((a, b) => a.displayOrder - b.displayOrder),
      );
      setOpen(false);
      setEditing(null);
      reset();
      setSuccess("Gallery image saved successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  const toggle = async (image: GalleryImage) => {
    setBusyId(image.id);
    setError(null);
    try {
      const { data } = await updateGalleryImageStatus(
        image.id,
        !image.isActive,
      );
      setImages((current) =>
        current.map((item) =>
          item.id === image.id ? data.galleryImage : item,
        ),
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };
  const remove = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    setError(null);
    try {
      await deleteGalleryImage(deleting.id);
      setImages((current) =>
        current.filter((image) => image.id !== deleting.id),
      );
      setSuccess("Gallery image deleted successfully.");
      setDeleting(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };
  const visible = images.filter((image) =>
    `${image.title} ${image.category ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="gallery-page">
      <header className="gallery-heading">
        <div>
          <p className="dashboard-eyebrow">Public showcase</p>
          <h1>Gallery images</h1>
          <p>Upload and organize images displayed in the salon gallery.</p>
        </div>
        <button onClick={create}>
          <Plus />
          Add image
        </button>
      </header>
      <section className="gallery-panel">
        <header>
          <div>
            <h2>Image collection</h2>
            <p>
              {images.length} image{images.length === 1 ? "" : "s"}
            </p>
          </div>
          <label>
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search images"
              aria-label="Search gallery images"
            />
          </label>
        </header>
        {error && !open && <p className="gallery-message is-error">{error}</p>}
        {success && <p className="gallery-message is-success">{success}</p>}
        {visible.length ? (
          <div className="gallery-grid">
            {visible.map((image) => (
              <GalleryCard
                key={image.id}
                image={image}
                busy={busyId === image.id}
                onEdit={edit}
                onToggle={(item) => void toggle(item)}
                onDelete={setDeleting}
              />
            ))}
          </div>
        ) : (
          <div className="gallery-empty">
            <Images />
            <h3>No gallery images found</h3>
            <p>Add an image or change your search.</p>
          </div>
        )}
      </section>
      {open && (
        <GalleryImageModal
          editing={Boolean(editing)}
          title={title}
          categoryId={categoryId}
          categories={categories}
          displayOrder={order}
          isActive={active}
          preview={preview}
          file={file}
          touched={touched}
          errors={errors}
          busy={busy}
          apiError={error}
          onTitle={setTitle}
          onCategory={setCategoryId}
          onOrder={setOrder}
          onActive={setActive}
          onFile={choose}
          onTouch={(field) =>
            setTouched((current) => ({ ...current, [field]: true }))
          }
          onClose={close}
          onSubmit={(event) => void save(event)}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete gallery image?"
        message={`${deleting?.title ?? "This image"} will be permanently removed from the gallery.`}
        confirmLabel="Delete image"
        busy={Boolean(deleting && busyId === deleting.id)}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void remove()}
      />
    </div>
  );
};
export default GalleryManagementPage;
