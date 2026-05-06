import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../service/product.service';
import { AuthService } from '../service/auth.service';
import { PieChartComponent } from '../component/pie-chart/pie-chart';

@Component({
  standalone: true,
  selector: 'app-report',
  imports: [CommonModule, FormsModule, PieChartComponent],
  templateUrl: './report.html',
  styleUrls: ['./report.css'],
})
export class ReportPage implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly report = signal<any | null>(null);

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  months = [
    { value: 1, label: 'Tháng 1' }, { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' }, { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' }, { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' }, { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' }, { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' }, { value: 12, label: 'Tháng 12' },
  ];

  years: number[] = [];

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 2000; y--) {
      this.years.push(y);
    }
    this.fetchReport();
  }

  fetchReport(): void {
    this.loading.set(true);
    this.error.set(null);
    this.report.set(null);
    this.productService.fetchMonthlyReport(this.selectedMonth, this.selectedYear).subscribe({
      next: (data: any) => {
        this.loading.set(false);
        this.report.set(data);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err?.error?.detail ?? 'Không thể tải báo cáo. Vui lòng thử lại.');
      },
    });
  }

  exportPdf(): void {
    window.print();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  getRole(): string | null {
    return this.authService.getRole();
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  isObject(val: any): boolean {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }

  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  isStringArray(val: any): boolean {
    return Array.isArray(val) && val.length > 0 && typeof val[0] === 'string';
  }

  private readonly PIE_OBJECT_KEYS = new Set(['brands', 'categories']);

  isPieObjectKey(key: string): boolean {
    return this.PIE_OBJECT_KEYS.has(key);
  }

  pluck(arr: any[], field: string): string[] {
    return arr.map(item => item[field] ?? '');
  }

  pluckNum(arr: any[], field: string): number[] {
    return arr.map(item => Number(item[field]) || 0);
  }

  formatLabel(key: string): string {
    const map: Record<string, string> = {
      month: 'Tháng',
      year: 'Năm',
      total_import: 'Tổng nhập',
      total_export: 'Tổng xuất',
      total_revenue: 'Doanh thu',
      total_cost: 'Chi phí nhập',
      profit: 'Lợi nhuận',
      total_orders: 'Tổng đơn hàng',
      total_receipts: 'Tổng phiếu nhập',
      import_count: 'Số lần nhập',
      export_count: 'Số lần xuất',
      import_value: 'Giá trị nhập',
      export_value: 'Giá trị xuất',
      product_name: 'Sản phẩm',
      product_id: 'Mã SP',
      quantity: 'Số lượng',
      revenue: 'Doanh thu',
      cost: 'Chi phí',
      receipts: 'Phiếu nhập',
      deliveries: 'Phiếu xuất',
      total_count: 'Tổng số phiếu',
      total_value: 'Tổng giá trị',
      daily: 'Theo ngày',
      date: 'Ngày',
      count: 'Số phiếu',
      total_products: 'Tổng sản phẩm',
      total_brands: 'Tổng thương hiệu',
      total_categories: 'Tổng danh mục',
      brands: 'Cơ cấu thương hiệu',
      categories: 'Cơ cấu danh mục',
      name: 'Tên',
      product_count: 'Số sản phẩm',
    };
    return map[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private readonly CURRENCY_KEYS = new Set([
    'total_revenue', 'total_cost', 'profit', 'import_value', 'export_value',
    'revenue', 'cost', 'unit_cost', 'total_value', 'value', 'amount',
    'discount_amount', 'total_amount', 'price', 'unit_price',
  ]);

  formatValue(val: any, key?: string): string {
    if (val === null || val === undefined) return '—';
    const isCurrency = key && this.CURRENCY_KEYS.has(key);
    // parse string numbers (API may return floats as strings)
    const num = typeof val === 'number' ? val : (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val)) ? Number(val) : null);
    if (num !== null) {
      if (isCurrency) {
        return num.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ₫';
      }
      return Number.isInteger(num)
        ? num.toLocaleString('vi-VN')
        : num.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    return String(val);
  }
}
