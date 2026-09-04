import {
  Asterisk,
  Clock3,
  ImagePlus,
  Pencil,
  Plus,
  Power,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  createSalonService,
  createSubService,
  deleteSubService,
  deleteSalonService,
  getServices,
  updateSalonService,
  updateSalonServiceStatus,
  updateSubService,
  uploadSalonServiceImage,
} from "../../services/salonService";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { getServiceCategories } from "../../services/serviceCategoryService";
import type { SalonService, ServiceCategory, SubService } from "../../types/service";
import { getApiErrorMessage } from "../../utils/apiError";
import { markFieldsTouched } from "../../utils/form";
import "./serviceManagementPage.css";

type RequiredField = "category" | "name" | "duration" | "description" | "price" | "image";
const requiredFields: RequiredField[] = ["category", "name", "duration", "description", "price", "image"];

const RequiredLabel = ({ children }: { children: string }) => (
  <span className="service-required-label">
    {children}
    <Asterisk aria-label="required" />
  </span>
);

const ServiceManagementPage = () => {
  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<SalonService | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [autoCapacity, setAutoCapacity] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Partial<Record<RequiredField, boolean>>>({});
  const [subServiceParent, setSubServiceParent] = useState<SalonService | null>(null);
  const [editingSubService, setEditingSubService] = useState<SubService | null>(null);
  const [subName, setSubName] = useState("");
  const [subDuration, setSubDuration] = useState("");
  const [subPrice, setSubPrice] = useState("");
  const [subImageUrl, setSubImageUrl] = useState("");
  const [subImageFile, setSubImageFile] = useState<File | null>(null);
  const [subImagePreview, setSubImagePreview] = useState("");
  const [subIsActive, setSubIsActive] = useState(true);
  const [subTouched, setSubTouched] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [deletingService, setDeletingService] = useState<SalonService | null>(null);
  const [deletingSubService, setDeletingSubService] = useState<{
    service: SalonService;
    subService: SubService;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getServices(), getServiceCategories()])
      .then(([serviceResponse, categoryResponse]) => {
        setServices(serviceResponse.data.services);
        setCategories(categoryResponse.data.categories);
      })
      .catch((e) => setError(getApiErrorMessage(e)));
  }, []);
  const visible = services.filter((service) =>
    `${service.name} ${service.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const close = () => {
    if (!busy) {
      setIsOpen(false);
      setEditing(null);
      setError(null);
      setTouched({});
    }
  };
  const openCreate = () => {
    setEditing(null);
    setName("");
    setCategoryId(categories.find((category) => category.isActive)?.id.toString() ?? "");
    setDescription("");
    setDuration("");
    setPrice("");
    setCapacity("0");
    setAutoCapacity(true);
    setImageUrl("");
    setImageFile(null);
    setImagePreview("");
    setIsActive(true);
    setError(null);
    setTouched({});
    setIsOpen(true);
  };
  const openEdit = (service: SalonService) => {
    setEditing(service);
    setName(service.name);
    setCategoryId(String(service.categoryId));
    setDescription(service.description ?? "");
    setDuration(String(service.durationMinutes));
    setPrice(String(service.price));
    setCapacity(String(service.maxConcurrentAppointments ?? service.assignedEmployeeCount));
    setAutoCapacity(service.maxConcurrentAppointments === null);
    setImageUrl(service.imageUrl ?? "");
    setImageFile(null);
    setImagePreview(service.imageUrl ?? "");
    setIsActive(service.isActive);
    setError(null);
    setTouched({});
    setIsOpen(true);
  };
  const touch = (field: RequiredField) =>
    setTouched((current) => ({ ...current, [field]: true }));
  const fieldErrors: Partial<Record<RequiredField, string>> = {
    category: !categoryId ? "Category is required." : undefined,
    name: !name.trim() ? "Name is required." : undefined,
    duration: !duration
      ? "Duration is required."
      : !Number.isInteger(Number(duration)) || Number(duration) <= 0
        ? "Enter a positive whole number."
        : undefined,
    description: !(description ?? "").trim() ? "Description is required." : undefined,
    price: !price
      ? "Price is required."
      : Number(price) <= 0
        ? "Enter a price greater than zero."
        : undefined,
    image: !imageFile && !(imageUrl ?? "").trim() ? "Service image is required." : undefined,
  };
  const capacityError = autoCapacity
    ? undefined
    : capacity === ""
    ? undefined
    : !Number.isInteger(Number(capacity)) || Number(capacity) <= 0
      ? "Enter a positive whole number."
      : editing && Number(capacity) > editing.assignedEmployeeCount
        ? `Capacity cannot exceed ${editing.assignedEmployeeCount} assigned employees.`
        : undefined;
  const chooseImage = (file: File | null) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError("Choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The service image must be 5 MB or smaller.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(markFieldsTouched(requiredFields));
    const minutes = Number(duration);
    const amount = Number(price);
    if (requiredFields.some((field) => fieldErrors[field]) || capacityError) {
      setError(null);
      return;
    }
    setBusy(true);
    try {
      let savedImageUrl = imageUrl.trim();
      if (imageFile) {
        const uploaded = await uploadSalonServiceImage(imageFile);
        savedImageUrl = uploaded.data.imageUrl;
      }
      const input = {
        categoryId: Number(categoryId),
        name: name.trim(),
        description: description.trim(),
        durationMinutes: minutes,
        price: amount,
        imageUrl: savedImageUrl,
        isActive,
        maxConcurrentAppointments: autoCapacity ? null : Number(capacity),
      };
      const response = editing
        ? await updateSalonService(editing.id, input)
        : await createSalonService(input);
      const saved = response.data.service;
      setServices((current) =>
        editing
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current],
      );
      setIsOpen(false);
      setEditing(null);
      setImageFile(null);
      setImagePreview("");
      setError(null);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const toggle = async (service: SalonService) => {
    try {
      const { data } = await updateSalonServiceStatus(
        service.id,
        !service.isActive,
      );
      setServices((current) =>
        current.map((item) => (item.id === service.id ? data.service : item)),
      );
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };
  const remove = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteSalonService(deletingService.id);
      setServices((current) =>
        current.filter((item) => item.id !== deletingService.id),
      );
      setDeletingService(null);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setIsDeleting(false);
    }
  };

  const reloadServices = async () => setServices((await getServices()).data.services);
  const openSubServiceForm = (service: SalonService, item: SubService | null = null) => {
    setSubServiceParent(service); setEditingSubService(item);
    setSubName(item?.name ?? ""); setSubDuration(item ? String(item.durationMinutes) : "");
    setSubPrice(item ? String(item.price) : ""); setSubImageUrl(item?.imageUrl ?? "");
    setSubImageFile(null); setSubImagePreview(item?.imageUrl ?? "");
    setSubIsActive(item?.isActive ?? true); setSubTouched(false); setSubError(null);
  };
  const closeSubServiceForm = () => {
    if (!busy) { setSubServiceParent(null); setEditingSubService(null); setSubError(null); }
  };
  const chooseSubServiceImage = (file: File | null) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) {
      setSubError("Choose a JPG, PNG, or WEBP image up to 5 MB."); return;
    }
    setSubImageFile(file); setSubImagePreview(URL.createObjectURL(file)); setSubError(null);
  };
  const submitSubService = async (event: FormEvent) => {
    event.preventDefault(); setSubTouched(true);
    if (!subServiceParent || !subName.trim() || !Number.isInteger(Number(subDuration)) || Number(subDuration) <= 0 ||
      !Number.isFinite(Number(subPrice)) || Number(subPrice) < 0 || (!subImageFile && !subImageUrl)) return;
    try {
      setBusy(true); setSubError(null);
      let savedImageUrl = subImageUrl;
      if (subImageFile) savedImageUrl = (await uploadSalonServiceImage(subImageFile)).data.imageUrl;
      const input = { name: subName.trim(), durationMinutes: Number(subDuration), price: Number(subPrice), imageUrl: savedImageUrl, isActive: subIsActive };
      if (editingSubService) await updateSubService(subServiceParent.id, editingSubService.id, input);
      else await createSubService(subServiceParent.id, input);
      await reloadServices(); setBusy(false); closeSubServiceForm();
    } catch (e) { setSubError(getApiErrorMessage(e)); } finally { setBusy(false); }
  };
  const removeSubService = async () => {
    if (!deletingSubService) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteSubService(deletingSubService.service.id, deletingSubService.subService.id);
      await reloadServices();
      setDeletingSubService(null);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="service-page">
      <header className="service-page_heading">
        <div>
          <p className="dashboard-eyebrow">Salon catalogue</p>
          <h1>Services</h1>
          <p>Manage services, pricing, duration, and availability.</p>
        </div>
        <button onClick={openCreate}>
          <Plus />
          Add service
        </button>
      </header>
      <section className="service-panel">
        <header>
          <div>
            <h2>Salon services</h2>
            <p>
              {services.length} service{services.length === 1 ? "" : "s"}
            </p>
          </div>
          <label>
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services"
              aria-label="Search services"
            />
          </label>
        </header>
        {error && !isOpen && (
          <p className="service-error" role="alert">
            {error}
          </p>
        )}
        <div className="service-grid">
          {visible.map((service) => (
            <article key={service.id}>
              <img src={service.imageUrl} alt="" />
              <div className="service-card_body">
                <span
                  className={service.isActive ? "is-active" : "is-inactive"}
                >
                  {service.isActive ? "Active" : "Inactive"}
                </span>
                <small className="service-category-badge">{service.categoryName}</small>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <dl>
                  <div>
                    <dt>
                      <Clock3 />
                      Duration
                    </dt>
                    <dd>{service.durationMinutes} min</dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd>Rs. {Number(service.price).toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt>Slot capacity</dt>
                    <dd>{Math.min(service.maxConcurrentAppointments ?? service.assignedEmployeeCount, service.assignedEmployeeCount)} {service.maxConcurrentAppointments === null ? "(auto)" : ""}</dd>
                  </div>
                </dl>
                <section className="sub-service-table">
                  <header><strong>Sub-services</strong><button type="button" disabled={busy} onClick={() => openSubServiceForm(service)}><Plus /> Add</button></header>
                  {service.subServices?.length ? service.subServices.map((item) => <div key={item.id}>
                    <img src={item.imageUrl} alt="" />
                    <span><b>{item.name}</b><small>{item.durationMinutes} min · Rs. {Number(item.price).toFixed(2)}</small></span>
                    <button type="button" title="Edit sub-service" onClick={() => openSubServiceForm(service, item)}><Pencil /></button>
                    <button type="button" title="Delete sub-service" disabled={isDeleting} onClick={() => setDeletingSubService({ service, subService: item })}><Trash2 /></button>
                  </div>) : <p>No sub-services. Customers can book the parent service.</p>}
                </section>
                <footer>
                  <button onClick={() => openEdit(service)} title="Edit">
                    <Pencil />
                  </button>
                  <button
                    onClick={() => void toggle(service)}
                    title={service.isActive ? "Deactivate" : "Activate"}
                  >
                    <Power />
                  </button>
                  <button
                    className="is-delete"
                    disabled={isDeleting}
                    onClick={() => setDeletingService(service)}
                    title="Delete"
                  >
                    <Trash2 />
                  </button>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </section>
      {isOpen && (
        <div
          className="service-modal"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-form-title"
          >
            <header>
              <div>
                <h2 id="service-form-title">
                  {editing ? "Edit service" : "Add service"}
                </h2>
                <p>Capacity is optional; other fields are required.</p>
              </div>
              <button onClick={close}>
                <X />
              </button>
            </header>
            <form onSubmit={(e) => void submit(e)}>
              <label>
                <RequiredLabel>Name</RequiredLabel>
                <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => touch("name")}
                  aria-invalid={Boolean(touched.name && fieldErrors.name)} />
                {touched.name && fieldErrors.name &&
                  <small className="service-field-error">{fieldErrors.name}</small>}
              </label>
              <label>
                <RequiredLabel>Category</RequiredLabel>
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} onBlur={() => touch("category")} aria-invalid={Boolean(touched.category && fieldErrors.category)}>
                  <option value="">Select a category</option>
                  {categories.filter((category) => category.isActive || category.id === editing?.categoryId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {touched.category && fieldErrors.category && <small className="service-field-error">{fieldErrors.category}</small>}
              </label>
              <label>
                <RequiredLabel>Duration (minutes)</RequiredLabel>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  onBlur={() => touch("duration")}
                  aria-invalid={Boolean(touched.duration && fieldErrors.duration)}
                />
                {touched.duration && fieldErrors.duration &&
                  <small className="service-field-error">{fieldErrors.duration}</small>}
              </label>
              <label className="is-wide">
                <RequiredLabel>Description</RequiredLabel>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => touch("description")}
                  aria-invalid={Boolean(touched.description && fieldErrors.description)}
                />
                {touched.description && fieldErrors.description &&
                  <small className="service-field-error">{fieldErrors.description}</small>}
              </label>
              <label>
                <RequiredLabel>Price (Rs.)</RequiredLabel>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onBlur={() => touch("price")}
                  aria-invalid={Boolean(touched.price && fieldErrors.price)}
                />
                {touched.price && fieldErrors.price &&
                  <small className="service-field-error">{fieldErrors.price}</small>}
              </label>
              <label className="service-image-field">
                <RequiredLabel>Service image</RequiredLabel>
                <span className="service-image-picker">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Selected service preview" />
                  ) : (
                    <ImagePlus aria-hidden="true" />
                  )}
                  <span>{imageFile?.name ?? (editing ? "Replace image" : "Choose image")}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => chooseImage(event.target.files?.[0] ?? null)}
                    onBlur={() => touch("image")}
                  />
                </span>
                <small>JPG, PNG or WEBP, up to 5 MB</small>
                {touched.image && fieldErrors.image &&
                  <small className="service-field-error">{fieldErrors.image}</small>}
              </label>
              <label className="service-capacity-field">
                <span>Appointments per time slot</span>
                <span className="service-capacity-auto">
                  <input
                    type="checkbox"
                    checked={autoCapacity}
                    onChange={(event) => {
                      const automatic = event.target.checked;
                      setAutoCapacity(automatic);
                      if (automatic) setCapacity(String(editing?.assignedEmployeeCount ?? 0));
                    }}
                  />
                  Automatically match assigned employees
                </span>
                <input
                  type="number"
                  min="1"
                  max={editing?.assignedEmployeeCount || undefined}
                  step="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  disabled={autoCapacity || !editing || editing.assignedEmployeeCount === 0}
                  aria-invalid={Boolean(capacityError)}
                />
                <small>
                  {autoCapacity
                    ? `Current automatic capacity: ${editing?.assignedEmployeeCount ?? 0} appointment${(editing?.assignedEmployeeCount ?? 0) === 1 ? "" : "s"} per slot.`
                    : `Manual capacity cannot exceed ${editing?.assignedEmployeeCount ?? 0} active assigned employee${(editing?.assignedEmployeeCount ?? 0) === 1 ? "" : "s"}.`}
                </small>
                {capacityError && <small className="service-field-error">{capacityError}</small>}
              </label>
              <label className="service-checkbox">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active service
              </label>
              {error && <p className="service-error">{error}</p>}
              <footer>
                <button type="button" onClick={close}>
                  Cancel
                </button>
                <button className="is-primary" disabled={busy}>
                  <Sparkles />
                  {busy ? "Saving..." : "Save service"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
      {subServiceParent && (
        <div className="service-modal sub-service-modal" onMouseDown={(event) => event.target === event.currentTarget && closeSubServiceForm()}>
          <section role="dialog" aria-modal="true" aria-labelledby="sub-service-form-title">
            <header>
              <div>
                <p className="dashboard-eyebrow">{subServiceParent.name}</p>
                <h2 id="sub-service-form-title">{editingSubService ? "Edit sub-service" : "Add sub-service"}</h2>
                <p>Customers will see this option under the parent service.</p>
              </div>
              <button type="button" onClick={closeSubServiceForm} aria-label="Close"><X /></button>
            </header>
            <form onSubmit={(event) => void submitSubService(event)}>
              <label>
                <RequiredLabel>Name</RequiredLabel>
                <input autoFocus value={subName} onChange={(event) => setSubName(event.target.value)} aria-invalid={subTouched && !subName.trim()} />
                {subTouched && !subName.trim() && <small className="service-field-error">Name is required.</small>}
              </label>
              <label>
                <RequiredLabel>Duration (minutes)</RequiredLabel>
                <input type="number" min="1" step="1" value={subDuration} onChange={(event) => setSubDuration(event.target.value)}
                  aria-invalid={subTouched && (!Number.isInteger(Number(subDuration)) || Number(subDuration) <= 0)} />
                {subTouched && (!Number.isInteger(Number(subDuration)) || Number(subDuration) <= 0) && <small className="service-field-error">Enter a positive whole number.</small>}
              </label>
              <label>
                <RequiredLabel>Price (Rs.)</RequiredLabel>
                <input type="number" min="0" step="0.01" value={subPrice} onChange={(event) => setSubPrice(event.target.value)}
                  aria-invalid={subTouched && (!Number.isFinite(Number(subPrice)) || Number(subPrice) < 0 || subPrice === "")} />
                {subTouched && (!Number.isFinite(Number(subPrice)) || Number(subPrice) < 0 || subPrice === "") && <small className="service-field-error">Enter a valid price.</small>}
              </label>
              <label className="service-image-field">
                <RequiredLabel>Sub-service image</RequiredLabel>
                <span className="service-image-picker">
                  {subImagePreview ? <img src={subImagePreview} alt="Sub-service preview" /> : <ImagePlus aria-hidden="true" />}
                  <span>{subImageFile?.name ?? (editingSubService ? "Replace image" : "Choose image")}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseSubServiceImage(event.target.files?.[0] ?? null)} />
                </span>
                <small>JPG, PNG or WEBP, up to 5 MB</small>
                {subTouched && !subImageFile && !subImageUrl && <small className="service-field-error">An image is required.</small>}
              </label>
              <label className="service-checkbox is-wide">
                <input type="checkbox" checked={subIsActive} onChange={(event) => setSubIsActive(event.target.checked)} />
                Active sub-service
              </label>
              {subError && <p className="service-error">{subError}</p>}
              <footer>
                <button type="button" onClick={closeSubServiceForm}>Cancel</button>
                <button className="is-primary" disabled={busy}><Sparkles />{busy ? "Saving..." : editingSubService ? "Save changes" : "Add sub-service"}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deletingService)}
        title="Delete service?"
        message={<>“{deletingService?.name}” will be permanently removed, including its sub-services.</>}
        confirmLabel="Delete service"
        busy={isDeleting}
        busyLabel="Deleting..."
        onCancel={() => setDeletingService(null)}
        onConfirm={() => void remove()}
      />
      <ConfirmDialog
        open={Boolean(deletingSubService)}
        title="Delete sub-service?"
        message={<>“{deletingSubService?.subService.name}” will be permanently removed.</>}
        confirmLabel="Delete sub-service"
        busy={isDeleting}
        busyLabel="Deleting..."
        onCancel={() => setDeletingSubService(null)}
        onConfirm={() => void removeSubService()}
      />
    </div>
  );
};
export default ServiceManagementPage;
