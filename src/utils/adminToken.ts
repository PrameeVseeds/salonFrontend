const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_EMAIL_KEY = "rememberedAdminEmail";
const ADMIN_REMEMBER_KEY = "rememberAdminLogin";

const canUseLocalStorage = (): boolean => typeof window !== "undefined";

export const getAdminToken = (): string | null => {
  if (!canUseLocalStorage()) {
    return null;
  }

  return (
    window.localStorage.getItem(ADMIN_TOKEN_KEY) ??
    window.sessionStorage.getItem(ADMIN_TOKEN_KEY)
  );
};

export const getRememberedAdminEmail = (): string => {
  if (!canUseLocalStorage()) 
    return "";
  return window.localStorage.getItem(ADMIN_EMAIL_KEY) ?? "";
};

export const isAdminLoginRemembered = (): boolean => {
  if (!canUseLocalStorage()) 
    return false;
  return window.localStorage.getItem(ADMIN_REMEMBER_KEY) === "true";
};

export const setAdminToken = (token: string,persist = false,email = "",): void => {
  if (canUseLocalStorage()) {
    removeAdminToken();
    const storage = persist ? window.localStorage : window.sessionStorage;
    storage.setItem(ADMIN_TOKEN_KEY, token);

    if (persist) {
      window.localStorage.setItem(ADMIN_REMEMBER_KEY, "true");
      window.localStorage.setItem(ADMIN_EMAIL_KEY, email);
    } else {
      window.localStorage.removeItem(ADMIN_REMEMBER_KEY);
      window.localStorage.removeItem(ADMIN_EMAIL_KEY);
    }
  }
};

export const removeAdminToken = (): void => {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
};

export const hasAdminToken = (): boolean => getAdminToken() !== null;
