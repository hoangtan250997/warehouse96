import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { resolveApiBaseUrl } from './api-config';

const BASE = resolveApiBaseUrl();
const PHONE_PRODUCTS_API_URL = `${BASE}/api/v1/products`;
const PHONE_BRANDS_API_URL = `${BASE}/api/v1/products/brands`;
const CURRENT_STOCK_API_URL = `${BASE}/api/v1/inventory/current-stock`;
const INVENTORY_API_URL = `${BASE}/api/v1/inventory`;
const CUSTOMERS_API_URL = `${BASE}/api/v1/customers`;
const SUPPLIERS_API_URL = `${BASE}/api/v1/suppliers`;
const GDN_API_URL = `${BASE}/api/v1/goods-delivery-notes`;
const GRN_API_URL = `${BASE}/api/v1/goods-receipt-notes`;
const REPORTS_API_URL = `${BASE}/api/v1/reports`;

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  fetchPhoneProducts(brandId?: number, productTypeId?: number): Observable<unknown> {
    let params = new HttpParams();
    if (brandId != null) {
      params = params.set('brand_id', brandId);
    }
    if (productTypeId != null) {
      params = params.set('product_type_id', productTypeId);
    }
    return this.http.get<unknown>(PHONE_PRODUCTS_API_URL, { params });
  }

  fetchBrands(productTypeId?: number): Observable<unknown> {
    let params = new HttpParams();
    if (productTypeId != null) {
      params = params.set('product_type_id', productTypeId);
    }
    return this.http.get<unknown>(PHONE_BRANDS_API_URL, { params });
  }

  fetchAllProducts(): Observable<any> {
    const params = new HttpParams().set('size', 100);
    return this.http.get<any>(PHONE_PRODUCTS_API_URL, { params });
  }

  fetchCurrentStock(productId: number): Observable<any> {
    return this.http.get<any>(`${CURRENT_STOCK_API_URL}/${productId}`);
  }

  fetchInventoryByProduct(productId: number, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('product_id', productId)
      .set('size', size);
    return this.http.get<any>(INVENTORY_API_URL, { params });
  }

  fetchCustomers(): Observable<any> {
    return this.http.get<any>(CUSTOMERS_API_URL).pipe(
      tap((res: any) => {
        const items: any[] = res?.items ?? res ?? [];
        if (items[0]?.label) {
          console.log('[Customers] first label:', items[0].label, '| char codes:', [...items[0].label].map(c => c.charCodeAt(0).toString(16)));
        }
      })
    );
  }

  fetchSuppliers(): Observable<any> {
    return this.http.get<any>(SUPPLIERS_API_URL).pipe(
      tap((res: any) => {
        const items: any[] = res?.items ?? res ?? [];
        if (items[0]?.label) {
          console.log('[Suppliers] first label:', items[0].label, '| char codes:', [...items[0].label].map(c => c.charCodeAt(0).toString(16)));
        }
      })
    );
  }

  createGoodsDeliveryNote(body: any): Observable<any> {
    return this.http.post<any>(GDN_API_URL, body);
  }

  createGoodsReceiptNote(body: any): Observable<any> {
    return this.http.post<any>(GRN_API_URL, body);
  }

  createProduct(body: any): Observable<any> {
    return this.http.post<any>(PHONE_PRODUCTS_API_URL, body);
  }

  fetchMonthlyReport(month: number, year: number): Observable<any> {
    const params = new HttpParams()
      .set('month', month)
      .set('year', year);
    return this.http.get<any>(`${REPORTS_API_URL}/monthly`, { params }).pipe(
      tap(data => {
        const cats: any[] = data?.categories ?? [];
        const brands: any[] = data?.brands ?? [];
        console.log('[Report] categories raw:', JSON.stringify(cats));
        console.log('[Report] brands raw:', JSON.stringify(brands));
        console.log('[Report] first category char codes:', cats[0]?.name ? [...cats[0].name].map(c => c.charCodeAt(0).toString(16)) : 'n/a');
      })
    );
  }
}
