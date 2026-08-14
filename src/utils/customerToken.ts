const CUSTOMER_TOKEN_KEY = "customerToken";

const canUseLocalStorage = (): boolean => typeof window !== "undefined";

export const getCustomerToken = (): string | null => {
  return canUseLocalStorage() ? window.localStorage.getItem(CUSTOMER_TOKEN_KEY) : null;
};

export const setCustomerToken = (token: string): void => {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  }
};

export const removeCustomerToken = (): void => {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  }
};

export const hasCustomerToken = (): boolean => getCustomerToken() !== null;
