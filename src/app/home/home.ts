import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductStateService } from '../service/product-state.service';
import { ProductService } from '../service/product.service';
import { ProductResponse, OpenFormEvent, OpenReceiptFormEvent } from '../component/product-response/product-response';

interface Customer {
  id: number;
  label: string;
  code: string;
}

interface Supplier {
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
  readonly suppliers = signal<Supplier[]>([]);
  readonly selectedItem = signal<OpenFormEvent | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitSuccess = signal(false);
  readonly gdnResponse = signal<any | null>(null);

  // GRN state
  readonly selectedReceiptItem = signal<OpenReceiptFormEvent | null>(null);
  readonly submittingReceipt = signal(false);
  readonly submitReceiptError = signal<string | null>(null);
  readonly submitReceiptSuccess = signal(false);
  readonly grnResponse = signal<any | null>(null);

  // New product state
  readonly showProductModal = signal(false);
  readonly submittingProduct = signal(false);
  readonly submitProductError = signal<string | null>(null);
  readonly submitProductSuccess = signal(false);
  readonly newProductBrands = signal<{ id: number; label: string }[]>([]);

  readonly PRODUCT_TYPES = [
    { id: 1, label: '📱 Điện thoại' },
    { id: 2, label: '💻 Laptop' },
    { id: 3, label: '📋 Máy tính bảng' },
    { id: 4, label: '🧊 Tủ lạnh' },
    { id: 5, label: '🫧 Máy giặt' },
    { id: 6, label: '📺 Tivi' },
    { id: 7, label: '❄️ Máy lạnh' },
    { id: 8, label: '🎧 Tai nghe' },
    { id: 9, label: '⌚ Đồng hồ thông minh' },
    { id: 10, label: '📷 Máy ảnh' },
  ];

  productData = {
    productTypeId: '' as string | number,
    brandId: '' as string | number,
    unitId: 1,
    label: '',
    code: '',
    model: '',
    notes: '',
    price: null as number | null,
  };

  receiptData = {
    code: '',
    supplierId: '',
    receivedDate: this.nowForInput(),
    receiptStatus: 'CONFIRMED',
    record: '',
    unitCost: null as number | null,
    serialNumbers: '',
  };

  private nowForInput(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  form = {
    code: '',
    customerId: '',
    deliveryDate: this.nowForInput(),
    deliveryStatus: 'CONFIRMED',
    discountAmount: null as number | null,
    discountPercent: null as number | null,
    record: '',
  };

  ngOnInit(): void {
    this.productService.fetchCustomers().subscribe({
      next: (res: any) => this.customers.set(res?.items ?? res ?? []),
    });
    this.productService.fetchSuppliers().subscribe({
      next: (res: any) => this.suppliers.set(res?.items ?? res ?? []),
    });
  }

  loadPhonesByBrand(brandId: number): void {
    this.productState.loadPhones(brandId);
  }

  openProductModal(): void {
    const currentTypeId = this.productState.currentProductTypeId() ?? '';
    this.productData = { productTypeId: currentTypeId, brandId: '', unitId: 1, label: '', code: '', model: '', notes: '', price: null };
    this.newProductBrands.set([]);
    this.submitProductError.set(null);
    this.submitProductSuccess.set(false);
    if (currentTypeId) {
      this.productService.fetchBrands(+currentTypeId).subscribe({
        next: (res: any) => this.newProductBrands.set(res ?? []),
      });
    }
    this.showProductModal.set(true);
  }

  closeProductModal(): void {
    this.showProductModal.set(false);
  }

  onProductTypeChange(): void {
    const typeId = +this.productData.productTypeId;
    if (!typeId) return;
    this.productData.brandId = '';
    this.productService.fetchBrands(typeId).subscribe({
      next: (res: any) => this.newProductBrands.set(res ?? []),
    });
  }

  submitProduct(): void {
    const { productTypeId, brandId, unitId, label, code, model, notes, price } = this.productData;
    if (!productTypeId || !brandId || !unitId || !label || !code) return;

    this.submittingProduct.set(true);
    this.submitProductError.set(null);

    const body: any = {
      product_type_id: +productTypeId,
      brand_id: +brandId,
      unit_id: +unitId,
      label,
      code,
    };
    if (model) body.model = model;
    if (notes) body.notes = notes;
    if (price != null) body.price = price;

    this.productService.createProduct(body).subscribe({
      next: () => {
        this.submittingProduct.set(false);
        this.submitProductSuccess.set(true);
      },
      error: (err: any) => {
        this.submittingProduct.set(false);
        this.submitProductError.set(err?.error?.detail ?? JSON.stringify(err?.error) ?? 'Lỗi tạo sản phẩm');
      },
    });
  }

  onOpenForm(event: OpenFormEvent): void {
    this.selectedItem.set(event);
    this.submitError.set(null);
    this.submitSuccess.set(false);
    this.gdnResponse.set(null);
    this.form = { code: '', customerId: '', deliveryDate: this.nowForInput(), deliveryStatus: 'CONFIRMED', discountAmount: null, discountPercent: null, record: '' };
  }

  onOpenReceiptForm(event: OpenReceiptFormEvent): void {
    this.selectedReceiptItem.set(event);
    this.submitReceiptError.set(null);
    this.submitReceiptSuccess.set(false);
    this.grnResponse.set(null);
    this.receiptData = { code: '', supplierId: '', receivedDate: this.nowForInput(), receiptStatus: 'confirmed', record: '', unitCost: null, serialNumbers: '' };
  }

  closeReceiptModal(): void {
    this.selectedReceiptItem.set(null);
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
        this.productState.loadPhones(this.productState.selectedBrandId() ?? undefined);
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.detail ?? JSON.stringify(err?.error) ?? 'Submission failed');
      },
    });
  }

  submitReceipt(): void {
    const item = this.selectedReceiptItem();
    if (!item || !this.receiptData.code || !this.receiptData.supplierId || !this.receiptData.receivedDate) return;

    const serialList = this.receiptData.serialNumbers
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (serialList.length < item.quantity) {
      this.submitReceiptError.set(`Cần nhập đủ ${item.quantity} serial number (hiện có ${serialList.length}).`);
      return;
    }

    const rawCost = item.product.current_price?.toString().replace(/\./g, '').replace(/,/g, '.') ?? '0';
    const unitCost = this.receiptData.unitCost ?? (parseFloat(rawCost) || 1);

    this.submittingReceipt.set(true);
    this.submitReceiptError.set(null);

    const body: any = {
      code: this.receiptData.code,
      supplier_id: +this.receiptData.supplierId,
      received_date: new Date(this.receiptData.receivedDate).toISOString(),
      receipt_status: this.receiptData.receiptStatus,
      items: [{
        product_id: item.product.id,
        unit_cost: unitCost,
        quantity: item.quantity,
        serial_numbers: serialList.slice(0, item.quantity),
      }],
    };
    if (this.receiptData.record) body.record = this.receiptData.record;

    this.productService.createGoodsReceiptNote(body).subscribe({
      next: (res: any) => {
        this.submittingReceipt.set(false);
        this.submitReceiptSuccess.set(true);
        this.grnResponse.set(res);
        this.productState.loadPhones(this.productState.selectedBrandId() ?? undefined);
      },
      error: (err: any) => {
        this.submittingReceipt.set(false);
        this.submitReceiptError.set(err?.error?.detail ?? JSON.stringify(err?.error) ?? 'Submission failed');
      },
    });
  }
}

