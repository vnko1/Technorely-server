import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { CookieOptions, Response } from "express";

import { Public, User } from "src/common/decorators";
import { CustomValidationPipe } from "src/common/pipes";
import { refreshToken } from "src/utils";

import { UserEntity } from "../users/user.entity";

import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local.guard";
import { JwtRefreshAuthGuard } from "./guards/jwt-refresh.guard";
import {
  AuthDto,
  AuthSchema,
  ResetPasswordDto,
  ResetPasswordSchema,
  VerifyPasswordDto,
  VerifyPasswordSchema,
} from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private cookieOptions: CookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sameSite: "none",
    secure: true,
  };

  @Post("register")
  @Public()
  @UsePipes(new CustomValidationPipe<AuthDto>(AuthSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  registerUser(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @Public()
  @UseGuards(LocalAuthGuard)
  async login(
    @User() user: UserEntity,
    @Res({ passthrough: true }) res: Response
  ) {
    const [access_token, refresh_token] = await this.authService.login(user);
    res.cookie(refreshToken, refresh_token, this.cookieOptions);
    return { access_token };
  }

  @Post("password/reset")
  @Public()
  @UsePipes(new CustomValidationPipe<ResetPasswordDto>(ResetPasswordSchema))
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post("password/set")
  @Public()
  @UsePipes(new CustomValidationPipe<VerifyPasswordDto>(VerifyPasswordSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  setPassword(@Body() dto: VerifyPasswordDto) {
    return this.authService.setPassword(dto);
  }

  @Post("refresh")
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @User() user: UserEntity,
    @Res({ passthrough: true }) res: Response
  ) {
    const [access_token, refresh_token] = await this.authService.login(user);

    res.cookie(refreshToken, refresh_token, this.cookieOptions);
    return { access_token };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res
      .cookie(refreshToken, "", {
        httpOnly: true,
        secure: true,
        maxAge: -1,
        sameSite: "none",
      })
      .status(HttpStatus.NO_CONTENT);
  }
}
