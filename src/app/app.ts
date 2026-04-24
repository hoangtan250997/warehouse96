import { Component, signal } from '@angular/core';
import { Header } from './header/header';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [Header, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('WarehouseFE');
}
