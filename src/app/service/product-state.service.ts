import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from './product.service';
import { ProductPageResponse } from '../component/product-response/product-response';
import { extractHttpError } from './http-error.util';

export interface Brand {
  id: number;
  label: string;
  code?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductStateService {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly response = signal<ProductPageResponse | null>(null);

  readonly brandsLoading = signal(false);
  readonly brandsError = signal<string | null>(null);
  readonly brands = signal<Brand[]>([]);
  readonly selectedBrandId = signal<number | null>(null);
  readonly currentProductTypeId = signal<number | null>(null);
  readonly searchQuery = signal<string>('');

  readonly filteredResponse = computed(() => {
    const res = this.response();
    const q = this.searchQuery().trim().toLowerCase();
    if (!res || !q) return res;
    return { ...res, items: res.items.filter(p => p.label.toLowerCase().includes(q)) };
  });

  private handleError(err: any, errorSignal: (msg: string) => void, loadingSignal: () => void): void {
    loadingSignal();
    if (err?.status === 401) {
      this.router.navigate(['/login']);
      return;
    }
    errorSignal(extractHttpError(err, 'Đã xảy ra lỗi không xác định'));
  }

  loadPhones(brandId?: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.response.set(null);
    this.selectedBrandId.set(brandId ?? null);

    this.productService.fetchPhoneProducts(brandId, this.currentProductTypeId() ?? undefined).subscribe({
      next: (data) => this.response.set(data as ProductPageResponse),
      error: (err) => this.handleError(err, (msg) => this.error.set(msg), () => this.loading.set(false)),
      complete: () => this.loading.set(false),
    });
  }

  loadBrands(productTypeId: number): void {
    this.brandsLoading.set(true);
    this.brandsError.set(null);
    this.brands.set([]);
    this.selectedBrandId.set(null);
    this.currentProductTypeId.set(productTypeId);

    this.productService.fetchBrands(productTypeId).subscribe({
      next: (data) => this.brands.set(data as Brand[]),
      error: (err) => this.handleError(err, (msg) => this.brandsError.set(msg), () => this.brandsLoading.set(false)),
      complete: () => this.brandsLoading.set(false),
    });

    // Also load all products for this type
    this.loadPhones();
  }
}
