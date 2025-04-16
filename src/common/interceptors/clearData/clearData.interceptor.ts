import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { deleteAllFiles, getPath } from "src/utils";

@Injectable()
export class ClearDataInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        tap(() => {
          deleteAllFiles(getPath("src", "temp")).catch(console.error);
        })
      )
      .pipe(
        catchError((error: unknown) => {
          deleteAllFiles(getPath("src", "temp")).catch(console.error);
          return throwError(() => error);
        })
      );
  }
}
