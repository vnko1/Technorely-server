import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { IRequest, EntityType } from "src/types";

export const User = createParamDecorator(
  (
    fields: Array<keyof EntityType> | keyof EntityType | void,
    ctx: ExecutionContext
  ) => {
    const request: IRequest = ctx.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      return user;
    }

    if (Array.isArray(fields)) {
      return fields.reduce((acc, key) => {
        acc[key] = user[key];
        return acc;
      }, {});
    }

    return fields ? user[fields] : user;
  }
);
