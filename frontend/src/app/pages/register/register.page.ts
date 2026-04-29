import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { RegisterPayload } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.page.html',
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  protected loading = false;
  protected errorMessage = '';
  protected readonly form = this.formBuilder.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['USER' as const],
    },
    { validators: passwordMatchValidator },
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: RegisterPayload = {
      name: raw.name.trim(),
      email: raw.email.trim(),
      password: raw.password,
      role: raw.role,
    };

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .register(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.notificationService.success('Conta criada com sucesso. Faça login para continuar.');
          void this.router.navigateByUrl('/login');
        },
        error: () => {
          this.errorMessage =
            'Não foi possível criar a conta. Verifique os dados ou tente outro e-mail.';
        },
      });
  }

  protected nameInvalid(): boolean {
    const control = this.form.controls.name;
    return control.invalid && (control.dirty || control.touched);
  }

  protected emailInvalid(): boolean {
    const control = this.form.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }

  protected passwordInvalid(): boolean {
    const control = this.form.controls.password;
    return control.invalid && (control.dirty || control.touched);
  }

  protected confirmPasswordInvalid(): boolean {
    const control = this.form.controls.confirmPassword;
    return control.invalid && (control.dirty || control.touched);
  }

  protected passwordsMismatch(): boolean {
    const confirmControl = this.form.controls.confirmPassword;
    return (
      this.form.hasError('passwordMismatch') &&
      (confirmControl.dirty || confirmControl.touched)
    );
  }
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}
