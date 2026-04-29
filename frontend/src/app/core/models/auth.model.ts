export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

export interface TokenResponse {
  token: string;
}

export interface JwtPayload {
  sub?: string;
  role?: string;
  exp?: number;
  [claim: string]: unknown;
}
