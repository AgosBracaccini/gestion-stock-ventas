import { ENDPOINTS } from "../config";
import { apiRequest } from "../http";

export interface TokenResponse {
  access: string;
  refresh: string;
}

export const authService = {
  login: (username: string, password: string) =>
    apiRequest<TokenResponse>(ENDPOINTS.token, {
      method: "POST",
      body: { username, password },
      skipAuth: true,
    }),
};
