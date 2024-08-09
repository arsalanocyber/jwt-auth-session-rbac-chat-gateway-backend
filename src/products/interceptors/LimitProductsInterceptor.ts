import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LimitProductsInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        const request = context.switchToHttp().getRequest();
        if (request.method === 'GET' && request.url === '/api/products') {
          // Limit the response to the first 3 products
          return data.slice(0, 3);
        }
        return data; // Return unmodified data for other requests
      }),
    );
  }
}
