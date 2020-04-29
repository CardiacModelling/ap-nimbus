import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Respect {@link https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name}! E.g.
 * can't set { 'Connection': 'close' }.
 */
@Injectable()
export class CacheBashingInterceptor implements HttpInterceptor {
  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const cacheBashReq = req.clone({
      setHeaders: {
        'Cache-control': 'private, no-cache, no-store, must-revalidate, post-check=0, precheck=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    return next.handle(cacheBashReq);
  }
}