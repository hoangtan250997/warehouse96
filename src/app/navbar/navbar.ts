import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductStateService } from '../service/product-state.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  private readonly productState = inject(ProductStateService);
  private readonly router = inject(Router);

  loadPhones(): void {
    this.productState.loadPhones();
  }

  fetchBrands(productTypeId: number): void {
    this.productState.loadBrands(productTypeId);
  }

  goToReport(): void {
    this.router.navigate(['/report']);
  }
}
