import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";

import { JwtPayloadType } from "src/types";
import { errorMessages } from "src/utils";

import { UsersService } from "../users/users.service";
import { UserEntity } from "../users/user.entity";

import { AuthDto, ResetPasswordDto, VerifyPasswordDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  private generateTokens(payload: JwtPayloadType, opt?: JwtSignOptions) {
    return Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: "7d",
        ...opt,
        secret: this.configService.get<string>("jwt_refresh_secret"),
      }),
    ]);
  }

  private async checkPass(pass: string, hash: string) {
    try {
      return await bcrypt.compare(pass, hash);
    } catch {
      return false;
    }
  }

  private async createPassword(pass: string) {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(pass, salt);
  }

  checkUser(id: number) {
    return this.usersService.findOneBy({ id });
  }

  async validateUser(
    email: string,
    pass: string
  ): Promise<Omit<UserEntity, "password"> | null> {
    const user = await this.usersService.findOneBy({ email });

    if (!user) return null;

    const isValidPass = await this.checkPass(pass, user.password);
    if (!isValidPass) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }

  async register(dto: AuthDto) {
    const { email, password } = dto;

    const isUserExist = await this.usersService.findOne({
      where: { email },
      withDeleted: true,
    });

    if (isUserExist) throw new ForbiddenException(errorMessages.email.exist);

    const user = new UserEntity(dto);
    user.password = await this.createPassword(password);
    return this.usersService.save(user);
  }

  login(user: Pick<UserEntity, "email" | "id" | "role">) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.generateTokens(payload);
  }

  async resetPassword({ email }: ResetPasswordDto) {
    const user = await this.usersService.findOneBy({ email });
    if (!user) throw new UnauthorizedException();
    user.passwordResetToken = randomBytes(20).toString("hex");
    user.updatedAt = new Date().toISOString();
    const updatedUser = await this.usersService.save(user);
    return updatedUser.passwordResetToken;
  }

  async setPassword({ password, passwordResetToken }: VerifyPasswordDto) {
    const user = await this.usersService.findOneBy({ passwordResetToken });
    if (!user) throw new UnauthorizedException();
    user.password = await this.createPassword(password);
    user.passwordResetToken = null;
    user.updatedAt = new Date().toISOString();
    return this.usersService.save(user);
  }
}
