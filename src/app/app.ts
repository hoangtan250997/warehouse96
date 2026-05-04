import { Component, signal } from '@angular/core';
import { Header } from './component/header/header';
import { Navbar } from './navbar/navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [Header, Navbar, RouterOutlet],
  template: `
    <app-header></app-header>
    <app-navbar></app-navbar>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('WarehouseFE');
}
