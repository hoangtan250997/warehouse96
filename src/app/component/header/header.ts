import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

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
