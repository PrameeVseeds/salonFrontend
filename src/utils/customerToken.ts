const CUSTOMER_TOKEN_KEY = "customerToken";

export const getCustomerToken = (): string | null => {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
};

export const setCustomerToken = (token: string): void => {
 localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
};

export const removeCustomerToken = (): void => {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  
};

export const hasCustomerToken = (): boolean => getCustomerToken() !== null;
