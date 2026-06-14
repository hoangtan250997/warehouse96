import { Component, Input, OnChanges, inject, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../service/product.service';

export interface Product {
  id: number;
  label: string;
  code: string;
  model: string;
  notes: string;
  current_price: string;
  unit_id: number;
  product_type_id: number;
  brand_id: number;
  created_date: string;
  updated_date: string;
}

export interface ProductPageResponse {
  items: Product[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface OpenFormEvent {
  product: Product;
  quantity: number;
  inventoryIds: number[];
}

export interface OpenReceiptFormEvent {
  product: Product;
  quantity: number;
}

@Component({
  standalone: true,
  selector: 'app-product-response',
  imports: [CommonModule],
  templateUrl: './product-response.html',
  styleUrl: './product-response.css',
})
export class ProductResponse implements OnChanges {
  private readonly productService = inject(ProductService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() response: ProductPageResponse | null = null;
  @Input() role: string | null = null;
  @Output() openForm = new EventEmitter<OpenFormEvent>();
  @Output() openReceiptForm = new EventEmitter<OpenReceiptFormEvent>();
  @Output() editPrice = new EventEmitter<Product>();

  stockMap: Record<number, number> = {};
  quantityMap: Record<number, number> = {};
  inventoryIdsMap: Record<number, number[]> = {};

  ngOnChanges(): void {
    if (this.response?.items) {
      this.stockMap = {};
      this.quantityMap = {};
      this.inventoryIdsMap = {};
      for (const item of this.response.items) {
        this.quantityMap[item.id] = 0;

        // Lấy tồn kho thực tế
        this.productService.fetchCurrentStock(item.id).subscribe({
          next: (res: any) => {
            console.log('[current-stock]', item.id, res);
            const stock = typeof res === 'number'
              ? res
              : (res?.quantity ?? res?.current_stock ?? res?.stock ?? 0);
            this.stockMap = { ...this.stockMap, [item.id]: stock };
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            console.error('[current-stock error]', item.id, err);
          },
        });

        // Lấy inventory IDs để dùng khi submit
        this.productService.fetchInventoryByProduct(item.id).subscribe({
          next: (res: any) => {
            console.log('[inventory ids]', item.id, res);
            const inventories: any[] = res?.items ?? res ?? [];
            const ids = inventories.map((inv: any) => inv.id);
            this.inventoryIdsMap = { ...this.inventoryIdsMap, [item.id]: ids };
          },
        });
      }
    }
  }

  getStock(id: number): number {
    return this.stockMap[id] ?? 0;
  }

  getQuantity(id: number): number {
    return this.quantityMap[id] ?? 0;
  }

  increment(id: number): void {
    const current = this.quantityMap[id] ?? 0;
    this.quantityMap = { ...this.quantityMap, [id]: current + 1 };
  }

  decrement(id: number): void {
    const current = this.quantityMap[id] ?? 0;
    if (current > 0) {
      this.quantityMap = { ...this.quantityMap, [id]: current - 1 };
    }
  }

  formatPrice(price: string): string {
    return Number(price).toLocaleString('vi-VN') + ' ₫';
  }

  onAddToCart(item: Product): void {
    const quantity = this.quantityMap[item.id] ?? 0;
    if (quantity <= 0) return;
    const inventoryIds = (this.inventoryIdsMap[item.id] ?? []).slice(0, quantity);
    this.openForm.emit({ product: item, quantity, inventoryIds });
  }

  onCreateReceipt(item: Product): void {
    const quantity = Math.max(this.quantityMap[item.id] ?? 0, 1);
    this.openReceiptForm.emit({ product: item, quantity });
  }

  onEditPrice(item: Product): void {
    this.editPrice.emit(item);
  }
}
