import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  JwtPayload,
  LoginCredentials,
  RegisterPayload,
  TokenResponse,
} from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly authenticatedState = signal(this.tokenStorage.hasToken());

  readonly authenticated = this.authenticatedState.asReadonly();

  login(credentials: LoginCredentials): Observable<void> {
    return this.http.post<TokenResponse>(`${environment.apiBaseUrl}/auth/login`, credentials).pipe(
      tap(({ token }) => {
        this.tokenStorage.setToken(token);
        this.authenticatedState.set(true);
      }),
      map(() => undefined),
    );
  }

  register(payload: RegisterPayload): Observable<string> {
    return this.http.post(`${environment.apiBaseUrl}/auth/register`, payload, {
      responseType: 'text',
    });
  }

  logout(redirect = true): void {
    this.tokenStorage.clear();
    this.authenticatedState.set(false);

    if (redirect) {
      void this.router.navigateByUrl('/login');
    }
  }

  isAuthenticated(): boolean {
    const token = this.tokenStorage.getToken();

    if (!token) {
      this.authenticatedState.set(false);
      return false;
    }

    const payload = this.jwtPayload(token);

    if (payload?.exp && Date.now() >= payload.exp * 1000) {
      this.tokenStorage.clear();
      this.authenticatedState.set(false);
      return false;
    }

    this.authenticatedState.set(true);
    return true;
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  userDisplayName(): string {
    const email = this.jwtPayload()?.sub;

    if (!email) {
      return 'usuário';
    }

    return email.split('@')[0] || 'usuário';
  }

  userRole(): string | null {
    return this.jwtPayload()?.role ?? null;
  }

  private jwtPayload(token = this.tokenStorage.getToken()): JwtPayload | null {
    if (!token) {
      return null;
    }

    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        Math.ceil(normalizedPayload.length / 4) * 4,
        '=',
      );
      return JSON.parse(window.atob(paddedPayload)) as JwtPayload;
    } catch {
      return null;
    }
  }
}
