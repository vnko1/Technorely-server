import { Injectable, NestInterceptor, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(_, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((data: T) => ({ data })));
  }
}
