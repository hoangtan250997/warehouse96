import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../service/product.service';
import { AuthService } from '../service/auth.service';
import * as XLSX from 'xlsx';

interface ReportRow {
  stt: number;
  label: string;
  code: string;
  model: string;
  unit: string;
  price: number;
  stock: number;
  totalValue: number;
}

@Component({
  standalone: true,
  selector: 'app-report',
  imports: [CommonModule],
  templateUrl: './report.html',
  styleUrl: './report.css',
})
export class ReportPage implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  rows = signal<ReportRow[]>([]);
  pendingStocks = signal(0);

  readonly reportDate = new Date();

  get currentUser(): string {
    return this.authService.getUsername() ?? 'N/A';
  }

  get grandTotal(): number {
    return this.rows().reduce((s, r) => s + r.totalValue, 0);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.productService.fetchAllProducts().subscribe({
      next: (res: any) => {
        const items: any[] = res?.items ?? res ?? [];
        const pending = items.length;
        this.pendingStocks.set(pending);

        const tempRows: ReportRow[] = items.map((p, i) => ({
          stt: i + 1,
          label: p.label,
          code: p.code,
          model: p.model ?? '',
          unit: 'Cái',
          price: Number(p.current_price) || 0,
          stock: 0,
          totalValue: 0,
        }));
        this.rows.set(tempRows);

        if (pending === 0) {
          this.loading.set(false);
          return;
        }

        items.forEach((p, i) => {
          this.productService.fetchCurrentStock(p.id).subscribe({
            next: (stockRes: any) => {
              const stock =
                typeof stockRes === 'number'
                  ? stockRes
                  : (stockRes?.quantity ?? stockRes?.current_stock ?? stockRes?.stock ?? 0);
              this.rows.update(rows => {
                const updated = [...rows];
                updated[i] = { ...updated[i], stock, totalValue: updated[i].price * stock };
                return updated;
              });
              this.pendingStocks.update(v => {
                const next = v - 1;
                if (next === 0) this.loading.set(false);
                return next;
              });
            },
            error: () => {
              this.pendingStocks.update(v => {
                const next = v - 1;
                if (next === 0) this.loading.set(false);
                return next;
              });
            },
          });
        });
      },
      error: () => {
        this.error.set('Không thể tải dữ liệu sản phẩm.');
        this.loading.set(false);
      },
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN') + ' ₫';
  }

  exportExcel(): void {
    const data: any[][] = [
      ['BÁO CÁO TỒN KHO - CÔNG TY TNHH TEAM96.VN'],
      [`Ngày in: ${this.reportDate.toLocaleDateString('vi-VN')}`, '', '', '', '', '', '', `Người lập: ${this.currentUser}`],
      [],
      ['STT', 'Mã sản phẩm', 'Tên sản phẩm', 'Model', 'ĐVT', 'Tồn kho', 'Đơn giá (₫)', 'Thành tiền (₫)'],
      ...this.rows().map(r => [r.stt, r.code, r.label, r.model, r.unit, r.stock, r.price, r.totalValue]),
      [],
      ['', '', '', '', '', 'TỔNG GIÁ TRỊ TỒN KHO:', '', this.grandTotal],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 }, { wch: 18 }, { wch: 40 }, { wch: 20 }, { wch: 8 }, { wch: 10 }, { wch: 18 }, { wch: 22 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tồn kho');
    XLSX.writeFile(wb, `BaoCaoTonKho_${this.reportDate.toISOString().slice(0, 10)}.xlsx`);
  }
}
