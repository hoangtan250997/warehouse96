import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../service/auth.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly loginLoading = signal(false);
  readonly loginError = signal<string | null>(null);
  readonly loginResponse = signal<any>(null);

  readonly loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submitLogin(event: Event) {
    event.preventDefault();

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.loginError.set('Username and password are required.');
      return;
    }

    this.loginError.set(null);
    const payload = this.loginForm.value as LoginRequest;
    this.loginLoading.set(true);
    this.loginResponse.set(null);

    this.authService.login(payload).subscribe({
      next: (data) => {
        this.authService.setToken(data.access_token, data.token_type, payload.username);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loginError.set('Login failed: ' + (err?.error?.detail ?? err?.message ?? 'Invalid credentials'));
        this.loginForm.reset();
        this.loginLoading.set(false);
      },
      complete: () => this.loginLoading.set(false),
    });
  }
}
