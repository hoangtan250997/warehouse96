import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-product-response',
  imports: [CommonModule],
  templateUrl: './product-response.html',
  styleUrl: './product-response.css',
})
export class ProductResponse {
  @Input() loading: (() => boolean) | null = null;
  @Input() error: (() => string | null) | null = null;
  @Input() response: (() => any) | null = null;

  isLoading(): boolean {
    return this.loading ? this.loading() : false;
  }

  getError(): string | null {
    return this.error ? this.error() : null;
  }

  getResponse(): any {
    return this.response ? this.response() : null;
  }
}
