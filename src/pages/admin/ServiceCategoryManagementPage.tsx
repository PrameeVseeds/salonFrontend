import { Pencil, Plus, Search, Tags, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createServiceCategory,
  deleteServiceCategory,
  getServiceCategories,
  updateServiceCategory,
} from "../../services/serviceCategoryService";
import type { ServiceCategory } from "../../types/service";
import { getApiErrorMessage } from "../../utils/apiError";
import "./serviceCategoryManagementPage.css";

const ServiceCategoryManagementPage = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () =>
    getServiceCategories().then(({ data }) => setCategories(data.categories));
  useEffect(() => {
    load().catch((requestError) => setError(getApiErrorMessage(requestError)));
  }, []);

  const visible = useMemo(
    () =>
      categories.filter((item) =>
        `${item.name} ${item.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [categories, query],
  );

  const showForm = (category: ServiceCategory | null) => {
    setEditing(category);
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setIsActive(category?.isActive ?? true);
    setTouched(false);
    setError(null);
    setSuccess(null);
    setOpen(true);
  };
  const close = () => {
    if (!busy) {
      setOpen(false);
      setEditing(null);
      setTouched(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const input = {
        name: name.trim(),
        description: description.trim(),
        isActive,
      };
      const saved = editing
        ? (await updateServiceCategory(editing.id, input)).data.category
        : (await createServiceCategory(input)).data.category;
      setCategories((current) =>
        (editing
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved]
        ).sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSuccess(`Category ${editing ? "updated" : "created"} successfully.`);
      close();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (category: ServiceCategory) => {
    if (!window.confirm(`Delete the “${category.name}” category?`)) return;
    setError(null);
    setSuccess(null);
    try {
      await deleteServiceCategory(category.id);
      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );
      setSuccess("Category deleted successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <div className="service-category-page">
      <header className="service-category-heading">
        <div>
          <p className="dashboard-eyebrow">Salon catalogue</p>
          <h1>Service categories</h1>
          <p>Organize services into clear groups for customers.</p>
        </div>
        <button type="button" onClick={() => showForm(null)}>
          <Plus /> Add category
        </button>
      </header>
      <section className="service-category-panel">
        <header>
          <div>
            <h2>Categories</h2>
            <p>
              {categories.length} categor{categories.length === 1 ? "y" : "ies"}
            </p>
          </div>
          <label>
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories"
              aria-label="Search categories"
            />
          </label>
        </header>
        {error && !open && (
          <p className="service-category-message is-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="service-category-message is-success">{success}</p>
        )}
        {visible.length ? (
          <div className="service-category-table">
            <div className="service-category-table-head">
              <span>Category</span>
              <span>Services</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {visible.map((category) => (
              <article key={category.id}>
                <div className="service-category-name">
                  <span>
                    <Tags />
                  </span>
                  <div>
                    <strong>{category.name}</strong>
                    <small>{category.description || "No description"}</small>
                  </div>
                </div>
                <b>{category.serviceCount}</b>
                <span
                  className={category.isActive ? "is-active" : "is-inactive"}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
                <div className="service-category-actions">
                  <button
                    type="button"
                    title="Edit category"
                    onClick={() => showForm(category)}
                  >
                    <Pencil />
                  </button>
                  <button
                    type="button"
                    className="is-delete"
                    title="Delete category"
                    disabled={category.serviceCount > 0}
                    onClick={() => void remove(category)}
                  >
                    <Trash2 />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="service-category-empty">
            <Tags />
            <h3>No categories found</h3>
            <p>Add a category or change your search.</p>
          </div>
        )}
      </section>
      {open && (
        <div
          className="service-category-modal"
          onMouseDown={(event) =>
            event.target === event.currentTarget && close()
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
          >
            <header>
              <div>
                <p className="dashboard-eyebrow">Service organization</p>
                <h2 id="category-form-title">
                  {editing ? "Edit category" : "Add category"}
                </h2>
              </div>
              <button type="button" onClick={close} aria-label="Close">
                <X />
              </button>
            </header>
            <form onSubmit={(event) => void submit(event)}>
              <label>
                <span>Category name *</span>
                <input
                  autoFocus
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onBlur={() => setTouched(true)}
                  aria-invalid={touched && !name.trim()}
                />
                {touched && !name.trim() && (
                  <small>Category name is required.</small>
                )}
              </label>
              <label>
                <span>Description</span>
                <textarea
                  maxLength={500}
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <small>{description.length}/500 characters</small>
              </label>
              <label className="service-category-checkbox">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                />{" "}
                Active category
              </label>
              {error && (
                <p className="service-category-message is-error" role="alert">
                  {error}
                </p>
              )}
              <footer>
                <button type="button" onClick={close}>
                  Cancel
                </button>
                <button className="is-primary" disabled={busy}>
                  {busy ? "Saving..." : "Save category"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default ServiceCategoryManagementPage;
