import { axiosClient } from "../api/axiosClient";
import { removeCustomerToken, setCustomerToken } from "../utils/customerToken";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import * as customerType from "../types/customer";

const CUSTOMER_ENDPOINT = "/customers";

export const loginCustomer = async (input: customerType.CustomerLoginInput):
Promise<ApiResponse<customerType.CustomerLoginResult>> => {
    const response = await axiosClient.post<ApiResponse<customerType.CustomerLoginResult>>
    (`${CUSTOMER_ENDPOINT}/login`, input);
    setCustomerToken(response.data.data.token);
    return response.data;
};

export const registerCustomer = async (input: customerType.RegisterCustomerInput): 
Promise<ApiResponse<customerType.CustomerResponseData>> => {
    const response = await axiosClient.post<ApiResponse<customerType.CustomerResponseData>>
    (`${CUSTOMER_ENDPOINT}/register`, input);
    return response.data;
};

export const getCustomerProfile = async (): Promise<ApiResponse<customerType.CustomerResponseData>> => {
    const response = await axiosClient.get<ApiResponse<customerType.CustomerResponseData>>
    (`${CUSTOMER_ENDPOINT}/profile`);
    return response.data;
};

export const updateCustomerProfile = async (input: customerType.UpdateCustomerProfileInput): 
Promise<ApiResponse<customerType.CustomerResponseData>> => {
    const response = await axiosClient.put<ApiResponse<customerType.CustomerResponseData>>
    (`${CUSTOMER_ENDPOINT}/profile`, input);
    return response.data;
};

export const changeCustomerPassword = async (input: customerType.ChangeCustomerPasswordInput,): 
Promise<ApiMessageResponse> => {
    const response = await axiosClient.patch<ApiMessageResponse>
    (`${CUSTOMER_ENDPOINT}/change-password`, input);
    return response.data;
};

export const updateCustomerProfileImage = async (profileImage: File,): 
Promise<ApiResponse<customerType.UpdateCustomerProfileImageResult>> => {
    const formData = new FormData();
    formData.append("profileImage", profileImage);

    const response = await axiosClient.patch<ApiResponse<customerType.UpdateCustomerProfileImageResult>>(
        `${CUSTOMER_ENDPOINT}/profile/image`,
        formData,
    );
    return response.data;
};

export const forgotCustomerPassword = async (input: customerType.ForgotCustomerPasswordInput,): 
Promise<ApiMessageResponse> => {
    const response = await axiosClient.post<ApiMessageResponse>
    (`${CUSTOMER_ENDPOINT}/forgot-password`, input);
    return response.data;
};

export const resetCustomerPassword = async (input: customerType.ResetCustomerPasswordInput,): 
Promise<ApiMessageResponse> => {
    const response = await axiosClient.post<ApiMessageResponse>
    (`${CUSTOMER_ENDPOINT}/reset-password`, input);
    return response.data;
};

export const logoutCustomer = (): void => {
    removeCustomerToken();
};
