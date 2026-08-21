import { Eye, Power, Search, UserRound, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useCustomerManagement } from "../../hooks/useCustomerManagement";
import type { Customer } from "../../types/customer";
import "./customerManagementPage.css";

type StatusFilter = "all" | "active" | "inactive";

const CustomerManagementPage = () => {
  const { customers, isLoading, updatingId, error, updateStatus } =
    useCustomerManagement();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [statusTarget, setStatusTarget] = useState<Customer | null>(null);

  const visibleCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesStatus =
        status === "all" ||
        (status === "active" ? customer.isActive : !customer.isActive);
      const matchesQuery =
        `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phone}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [customers, query, status]);

  const activeCount = customers.filter((customer) => customer.isActive).length;

  const confirmStatusChange = async () => {
    if (!statusTarget) return;
    const changed = await updateStatus(statusTarget);
    if (changed) {
      if (selected?.id === statusTarget.id) {
        setSelected({ ...selected, isActive: !selected.isActive });
      }
      setStatusTarget(null);
    }
  };

  return (
    <div className="customer-page">
      <header className="customer-page_heading">
        <div>
          <p className="dashboard-eyebrow">Customer management</p>
          <h1>Customers</h1>
          <p>Review registered customers and manage their account access.</p>
        </div>
      </header>

      <section className="customer-stats" aria-label="Customer summary">
        <article>
          <span>
            <Users />
          </span>
          <div>
            <small>Total customers</small>
            <strong>{isLoading ? "--" : customers.length}</strong>
          </div>
        </article>
        <article>
          <span className="is-active">
            <UserRound />
          </span>
          <div>
            <small>Active customers</small>
            <strong>{isLoading ? "--" : activeCount}</strong>
          </div>
        </article>
        <article>
          <span className="is-inactive">
            <UserRound />
          </span>
          <div>
            <small>Inactive customers</small>
            <strong>{isLoading ? "--" : customers.length - activeCount}</strong>
          </div>
        </article>
      </section>

      <section className="customer-panel">
        <header>
          <div>
            <h2>Registered customers</h2>
            <p>
              {visibleCustomers.length} customer
              {visibleCustomers.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="customer-filters">
            <label>
              <Search />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customers"
                aria-label="Search customers"
              />
            </label>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
              aria-label="Filter customers by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </header>

        {error && (
          <p className="customer-message" role="alert">
            {error}
          </p>
        )}
        {isLoading ? (
          <p className="customer-empty">Loading customers...</p>
        ) : (
          <div className="customer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-person">
                        {customer.profileImage ? (
                          <img src={customer.profileImage} alt="" />
                        ) : (
                          <span>
                            {customer.firstName[0]}
                            {customer.lastName[0]}
                          </span>
                        )}
                        <div>
                          <strong>
                            {customer.firstName} {customer.lastName}
                          </strong>
                          <small>{customer.email}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Phone">{customer.phone}</td>
                    <td data-label="Status">
                      <span
                        className={
                          customer.isActive ? "is-active" : "is-inactive"
                        }
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td data-label="Registered">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="customer-actions">
                        <button
                          type="button"
                          onClick={() => setSelected(customer)}
                          title="View customer"
                        >
                          <Eye />
                        </button>
                        <button
                          type="button"
                          className={
                            customer.isActive ? "is-deactivate" : "is-activate"
                          }
                          onClick={() => setStatusTarget(customer)}
                          title={
                            customer.isActive
                              ? "Deactivate customer"
                              : "Activate customer"
                          }
                        >
                          <Power />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleCustomers.length === 0 && (
              <p className="customer-empty">No customers match your search.</p>
            )}
          </div>
        )}
      </section>

      {selected && (
        <div
          className="customer-detail-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-detail-title"
          >
            <header>
              <div>
                <h2 id="customer-detail-title">Customer details</h2>
                <p>Registered account information</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close customer details"
              >
                <X />
              </button>
            </header>
            <div className="customer-detail-profile">
              {selected.profileImage ? (
                <img src={selected.profileImage} alt="" />
              ) : (
                <span>
                  {selected.firstName[0]}
                  {selected.lastName[0]}
                </span>
              )}
              <div>
                <h3>
                  {selected.firstName} {selected.lastName}
                </h3>
                <span
                  className={selected.isActive ? "is-active" : "is-inactive"}
                >
                  {selected.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <dl>
              <div>
                <dt>Email address</dt>
                <dd>{selected.email}</dd>
              </div>
              <div>
                <dt>Phone number</dt>
                <dd>{selected.phone}</dd>
              </div>
              <div>
                <dt>Registered</dt>
                <dd>{new Date(selected.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{new Date(selected.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>
            <footer>
              <button type="button" onClick={() => setStatusTarget(selected)}>
                <Power />
                {selected.isActive ? "Deactivate account" : "Activate account"}
              </button>
            </footer>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={
          statusTarget?.isActive ? "Deactivate customer?" : "Activate customer?"
        }
        message={
          statusTarget
            ? `${statusTarget.isActive ? "Deactivate" : "Activate"} ${statusTarget.firstName} ${statusTarget.lastName}'s account?`
            : ""
        }
        confirmLabel={statusTarget?.isActive ? "Deactivate" : "Activate"}
        busyLabel="Updating..."
        tone={statusTarget?.isActive ? "danger" : "primary"}
        busy={updatingId !== null}
        onConfirm={() => void confirmStatusChange()}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
};

export default CustomerManagementPage;
