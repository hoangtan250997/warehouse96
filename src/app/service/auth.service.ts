import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const LOGIN_API_URL = `${environment.apiBaseUrl}/api/v1/auth/login`;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'warehousefe.accessToken';
  private readonly typeKey = 'warehousefe.tokenType';
  private readonly usernameKey = 'warehousefe.username';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const body = new HttpParams()
      .set('username', credentials.username)
      .set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<LoginResponse>(LOGIN_API_URL, body.toString(), { headers });
  }

  setToken(token: string, tokenType: string, username?: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.typeKey, tokenType);
    if (username) localStorage.setItem(this.usernameKey, username);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  decodeToken(): Record<string, any> | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    const payload = this.decodeToken();
    return payload?.['role'] ?? payload?.['roles'] ?? payload?.['scope'] ?? null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getTokenType(): string {
    return localStorage.getItem(this.typeKey) ?? 'Bearer';
  }

  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `${this.getTokenType()} ${token}` : null;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.typeKey);
    localStorage.removeItem(this.usernameKey);
  }
}
