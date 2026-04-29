import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(TokenStorageService).getToken();
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);
  const isAuthRequest = request.url.includes('/auth/login') || request.url.includes('/auth/register');

  if (!token || !isApiRequest || isAuthRequest) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
