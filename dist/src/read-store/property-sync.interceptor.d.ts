import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ReadStoreService } from './read-store.service';
export declare class PropertySyncInterceptor implements NestInterceptor {
    private readonly readStore;
    constructor(readStore: ReadStoreService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
export declare const ListingSyncInterceptor: typeof PropertySyncInterceptor;
