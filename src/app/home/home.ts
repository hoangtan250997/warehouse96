import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductStateService } from '../service/product-state.service';
import { ProductService } from '../service/product.service';
import { ProductResponse, OpenFormEvent } from '../component/product-response/product-response';

interface Customer {
  id: number;
  label: string;
  code: string;
}

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, FormsModule, ProductResponse],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage implements OnInit {
  readonly productState = inject(ProductStateService);
  private readonly productService = inject(ProductService);

  readonly customers = signal<Customer[]>([]);
  readonly selectedItem = signal<OpenFormEvent | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitSuccess = signal(false);
  readonly gdnResponse = signal<any | null>(null);

  private nowForInput(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  form = {
    code: '',
    customerId: '',
    deliveryDate: this.nowForInput(),
    deliveryStatus: 'confirmed',
    discountAmount: null as number | null,
    discountPercent: null as number | null,
    record: '',
  };

  ngOnInit(): void {
    this.productService.fetchCustomers().subscribe({
      next: (res: any) => this.customers.set(res?.items ?? res ?? []),
    });
  }

  loadPhonesByBrand(brandId: number): void {
    this.productState.loadPhones(brandId);
  }

  onOpenForm(event: OpenFormEvent): void {
    this.selectedItem.set(event);
    this.submitError.set(null);
    this.submitSuccess.set(false);
    this.gdnResponse.set(null);
    this.form = { code: '', customerId: '', deliveryDate: this.nowForInput(), deliveryStatus: 'confirmed', discountAmount: null, discountPercent: null, record: '' };
  }

  closeModal(): void {
    this.selectedItem.set(null);
  }

  submitOrder(): void {
    const item = this.selectedItem();
    if (!item || !this.form.code || !this.form.customerId || !this.form.deliveryDate) return;

    this.submitting.set(true);
    this.submitError.set(null);

    const cachedIds = item.inventoryIds.slice(0, item.quantity);
    if (cachedIds.length > 0) {
      this._doSubmit(item, cachedIds);
    } else {
      // Cache chưa sẵn sàng, fetch lại
      this.productService.fetchInventoryByProduct(item.product.id, item.quantity).subscribe({
        next: (res: any) => {
          const inventories: any[] = res?.items ?? res ?? [];
          const ids = inventories.slice(0, item.quantity).map((inv: any) => inv.id);
          if (ids.length === 0) {
            this.submitting.set(false);
            this.submitError.set('Không đủ tồn kho để xuất. Vui lòng thử lại.');
            return;
          }
          this._doSubmit(item, ids);
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set('Không thể lấy thông tin kho. Vui lòng thử lại.');
        },
      });
    }
  }

  private _doSubmit(item: OpenFormEvent, inventoryIds: number[]): void {
    const rawPrice = item.product.current_price?.toString().replace(/\./g, '').replace(/,/g, '.') ?? '0';
    const unitPrice = parseFloat(rawPrice) || 1;

    console.log('[GDN inventory_ids]', inventoryIds);
    const body: any = {
      code: this.form.code,
      customer_id: +this.form.customerId,
      delivery_date: new Date(this.form.deliveryDate).toISOString(),
      delivery_status: this.form.deliveryStatus,
      items: [{
        product_id: item.product.id,
        unit_price: unitPrice,
        inventory_ids: inventoryIds,
      }],
    };
    if (this.form.discountAmount != null) body.discount_amount = this.form.discountAmount;
    if (this.form.discountPercent != null) body.discount_percent = this.form.discountPercent;
    if (this.form.record) body.record = this.form.record;

    console.log('[GDN body]', JSON.stringify(body, null, 2));

    this.productService.createGoodsDeliveryNote(body).subscribe({
      next: (res: any) => {
        this.submitting.set(false);
        this.submitSuccess.set(true);
        this.gdnResponse.set(res);
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.detail ?? JSON.stringify(err?.error) ?? 'Submission failed');
      },
    });
  }
}
