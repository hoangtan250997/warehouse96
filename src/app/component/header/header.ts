import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ProductStateService } from '../../service/product-state.service';
import { BackendKey, activeBackend, setSelectedBackend } from '../../service/api-config';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly productState = inject(ProductStateService);

  onSearch(event: Event): void {
    this.productState.searchQuery.set((event.target as HTMLInputElement).value);
  }

  currentBackend(): BackendKey {
    return activeBackend();
  }

  /**
   * Switch the API backend at runtime. The two backends don't share auth
   * (different SECRET_KEY + database), so we clear the session and reload so
   * every service re-reads the new base URL and the guard sends us to /login.
   */
  switchBackend(event: Event): void {
    const key = (event.target as HTMLSelectElement).value as BackendKey;
    if (key === this.currentBackend()) return;
    setSelectedBackend(key);
    this.authService.logout();
    window.location.reload();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUsername(): string | null {
    return this.authService.getUsername();
  }

  getRole(): string | null {
    return this.authService.getRole();
  }

  getRoleLabel(): string {
    const roleMap: Record<string, string> = {
      MANAGER: '👑 Manager',
      SALES: '🛒 Sales',
      WAREHOUSE_STAFF: '📦 Kho',
      ACCOUNTANT: '📊 Kế toán',
    };
    return roleMap[this.authService.getRole() ?? ''] ?? (this.authService.getRole() ?? '');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
