import { adminAxiosClient } from "../api/adminAxiosClient";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import type {
  CustomerResponseData,
  CustomersResponseData,
} from "../types/customer";

const CUSTOMERS_ENDPOINT = "/customers";

export const getManagedCustomers = async ():
  Promise<ApiResponse<CustomersResponseData>> =>
  (
    await adminAxiosClient.get<ApiResponse<CustomersResponseData>>(
      CUSTOMERS_ENDPOINT,
    )
  ).data;

export const getManagedCustomer = async (customerId: number,):
  Promise<ApiResponse<CustomerResponseData>> =>
  (
    await adminAxiosClient.get<ApiResponse<CustomerResponseData>>(
      `${CUSTOMERS_ENDPOINT}/${customerId}`,
    )
  ).data;

export const updateManagedCustomerStatus = async (customerId: number, isActive: boolean,):
  Promise<ApiResponse<CustomerResponseData>> =>
  (
    await adminAxiosClient.patch<ApiResponse<CustomerResponseData>>(
      `${CUSTOMERS_ENDPOINT}/${customerId}/status`,
      { isActive },
    )
  ).data;

export const deleteManagedCustomer = async (customerId: number): Promise<ApiMessageResponse> =>
  (
    await adminAxiosClient.delete<ApiMessageResponse>(
      `${CUSTOMERS_ENDPOINT}/${customerId}`,
    )
  ).data;
