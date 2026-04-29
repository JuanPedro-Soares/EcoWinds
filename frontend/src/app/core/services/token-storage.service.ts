import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly tokenKey = 'ecowinds.access_token';

  getToken(): string | null {
    return this.storage?.getItem(this.tokenKey) ?? null;
  }

  setToken(token: string): void {
    this.storage?.setItem(this.tokenKey, token);
  }

  clear(): void {
    this.storage?.removeItem(this.tokenKey);
  }

  hasToken(): boolean {
    return Boolean(this.getToken());
  }

  private get storage(): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.sessionStorage;
  }
}
