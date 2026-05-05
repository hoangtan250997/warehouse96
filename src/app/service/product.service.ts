import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const PHONE_PRODUCTS_API_URL = '/api/v1/products';
const PHONE_BRANDS_API_URL = '/api/v1/products/brands';
const CURRENT_STOCK_API_URL = '/api/v1/inventory/current-stock';
const INVENTORY_API_URL = '/api/v1/inventory';
const CUSTOMERS_API_URL = '/api/v1/customers';
const SUPPLIERS_API_URL = '/api/v1/suppliers';
const GDN_API_URL = '/api/v1/goods-delivery-notes';
const GRN_API_URL = '/api/v1/goods-receipt-notes';

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
    return this.http.get<any>(CUSTOMERS_API_URL);
  }

  fetchSuppliers(): Observable<any> {
    return this.http.get<any>(SUPPLIERS_API_URL);
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
}
