import { Component, signal } from '@angular/core';
import { Header } from './component/header/header';
import { Navbar } from './navbar/navbar';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [Header, Navbar, RouterOutlet, CommonModule],
  template: `
    <app-header *ngIf="!isLoginPage()"></app-header>
    <app-navbar *ngIf="!isLoginPage() && !isReportPage()"></app-navbar>
    <main [class]="isLoginPage() ? '' : (isReportPage() ? 'content content-no-sidebar' : 'content')">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('WarehouseFE');

  constructor(private router: Router) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isReportPage(): boolean {
    return this.router.url === '/report';
  }
}
