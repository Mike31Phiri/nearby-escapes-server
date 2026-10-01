import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ReadStoreService } from './read-store.service';

/**
 * Attach this interceptor to any property or unit write endpoint.
 * It fires a BullMQ property-sync job AFTER the handler succeeds,
 * so the read store is updated without blocking the response.
 */
@Injectable()
export class PropertySyncInterceptor implements NestInterceptor {
  constructor(private readonly readStore: ReadStoreService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (result: any) => {
        // Can be propertyId or id or from request params
        const req = context.switchToHttp().getRequest();
        const propertyId = result?.propertyId || result?.id || req?.params?.id;
        const deleted = result?.deleted === true;
        if (propertyId) {
          try {
            await this.readStore.enqueueSync(propertyId, deleted);
          } catch {
            // Background read-store queue failure does not block primary operation
          }
        }
      }),
    );
  }
}

// Backwards compatibility alias
export const ListingSyncInterceptor = PropertySyncInterceptor;
