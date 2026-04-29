import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { TokenStorageService } from '../services/token-storage.service';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const notificationService = inject(NotificationService);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = request.url.includes('/auth/login');
      const message = resolveHttpErrorMessage(error);

      if (error.status === 401 || error.status === 403) {
        tokenStorage.clear();

        if (!isLoginRequest) {
          notificationService.error('Sessão expirada ou sem permissão. Faça login novamente.');
          void router.navigateByUrl('/login');
        }
      } else if (!isLoginRequest) {
        notificationService.error(message);
      }

      return throwError(() => error);
    }),
  );
};

function resolveHttpErrorMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  if (error.error && typeof error.error === 'object' && 'message' in error.error) {
    return String(error.error.message);
  }

  if (error.status === 0) {
    return 'Não foi possível conectar ao backend. Verifique se a API está em execução.';
  }

  return 'Não foi possível concluir a operação. Tente novamente.';
}
