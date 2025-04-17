import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

import { JwtPayloadType } from "src/types/types";
import { refreshToken } from "src/utils";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(
    configService: ConfigService,
    private moduleRef: ModuleRef
  ) {
    const jwt_refresh_secret = configService.get<string>(
      "jwt_refresh_secret"
    ) as string;

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.cookies?.[refreshToken] as string;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwt_refresh_secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayloadType) {
    const contextId = ContextIdFactory.getByRequest(request);
    const authService = await this.moduleRef.resolve(AuthService, contextId);

    const user = await authService.checkUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
