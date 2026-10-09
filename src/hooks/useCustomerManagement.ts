import { useEffect, useState } from "react";
import {deleteManagedCustomer,getManagedCustomers,updateManagedCustomerStatus,} from "../services/customerManagementService";
import type { Customer } from "../types/customer";
import { getApiErrorMessage } from "../utils/apiError";

export const useCustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getManagedCustomers()
      .then(({ data }) => {
        if (active) 
          setCustomers(data.customers);
      })
      .catch((requestError) => {
        if (active) 
          setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) 
          setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateStatus = async (customer: Customer) => {
    setUpdatingId(customer.id);
    setError(null);
    try {
      const { data } = await updateManagedCustomerStatus(
        customer.id,
        !customer.isActive,
      );
      setCustomers((current) =>
        current.map((item) => (item.id === customer.id ? data.customer : item)),
      );
      return true;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteCustomer = async (customer: Customer) => {
    if (customer.isActive) {
      setError("Only inactive customers can be deleted.");
      return false;
    }
    setDeletingId(customer.id);
    setError(null);
    try {
      await deleteManagedCustomer(customer.id);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
      return true;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  return { 
    customers, 
    isLoading, 
    updatingId, 
    deletingId,
    error, 
    updateStatus,
    deleteCustomer,
  };
};
