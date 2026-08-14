const ADMIN_TOKEN_KEY = "adminToken";

const canUseLocalStorage = (): boolean => typeof window !== "undefined";

export const getAdminToken = (): string | null => {
  if (!canUseLocalStorage()) {
    return null;
  }

  return window.localStorage.getItem(ADMIN_TOKEN_KEY)
    ?? window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string, persist = true): void => {
  if (canUseLocalStorage()) {
    removeAdminToken();
    const storage = persist ? window.localStorage : window.sessionStorage;
    storage.setItem(ADMIN_TOKEN_KEY, token);
  }
};

export const removeAdminToken = (): void => {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
};

export const hasAdminToken = (): boolean => getAdminToken() !== null;
