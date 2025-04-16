import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

import { IRequest } from "src/types";

@Injectable()
export class ProfileGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: IRequest = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    if (!userId) {
      return false;
    }

    return Object.values(request.params).some((id) => parseInt(id) === userId);
  }
}
