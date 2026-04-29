import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly currentNotification = signal<AppNotification | null>(null);
  private closeTimer: number | null = null;

  readonly notification = this.currentNotification.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  clear(): void {
    if (this.closeTimer !== null) {
      window.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }

    this.currentNotification.set(null);
  }

  private show(type: NotificationType, message: string): void {
    this.clear();
    this.currentNotification.set({ id: Date.now(), type, message });
    this.closeTimer = window.setTimeout(() => this.currentNotification.set(null), 4200);
  }
}
