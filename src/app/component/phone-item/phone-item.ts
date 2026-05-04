import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../service/product.service';
import { ProductResponse } from '../product-response/product-response';

@Component({
  standalone: true,
  selector: 'app-phone-item',
  imports: [CommonModule, ProductResponse],
  templateUrl: './phone-item.html',
  styleUrl: './phone-item.css',
})
export class PhoneItem {
  private readonly productService = inject(ProductService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly response = signal<any>(null);

  loadPhones(): void {
    this.loading.set(true);
    this.error.set(null);
    this.response.set(null);

    this.productService.fetchPhoneProducts().subscribe({
      next: (data) => this.response.set(data),
      error: (err) => this.error.set('API request failed: ' + (err?.message ?? err)),
      complete: () => this.loading.set(false),
    });
  }
}
