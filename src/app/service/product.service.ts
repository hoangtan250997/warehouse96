import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const PHONE_PRODUCTS_API_URL = '/api/v1/products?category=phone&brand=Apple';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  fetchPhoneProducts(): Observable<unknown> {
    return this.http.get<unknown>(PHONE_PRODUCTS_API_URL);
  }
}
