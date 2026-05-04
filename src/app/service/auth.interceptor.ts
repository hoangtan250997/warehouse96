import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authHeader = this.authService.getAuthorizationHeader();

    if (!authHeader) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: authHeader,
      },
    });

    return next.handle(authReq);
  }
}
