import Cookies from "js-cookie";

export const getAuthToken = (): string | null => {
  return Cookies.get("access_token") || null;
};

export const setAuthToken = (token: string): void => {
  Cookies.set("access_token", token, { expires: 7 });
};

export const removeAuthToken = (): void => {
  Cookies.remove("access_token");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
