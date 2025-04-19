import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { DataSource } from "typeorm";

import { JwtPayloadType } from "src/types";
import { AppService } from "src/common/services";

import { UsersService } from "../users/users.service";
import { UserEntity } from "../users/user.entity";

import { AuthDto, ResetPasswordDto, VerifyPasswordDto } from "./dto";

@Injectable()
export class AuthService extends AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private dataSource: DataSource
  ) {
    super();
  }

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
    return this.usersService.addUser(dto);
  }

  login(user: Pick<UserEntity, "email" | "id" | "role">) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.generateTokens(payload);
  }

  async resetPassword({ email }: ResetPasswordDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneBy(UserEntity, { email });
      if (!user) throw new UnauthorizedException();

      user.passwordResetToken = this.randomString();
      user.updatedAt = new Date().toISOString();
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return user.passwordResetToken;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async setPassword({ password, passwordResetToken }: VerifyPasswordDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager.findOneBy(UserEntity, {
        passwordResetToken,
      });
      if (!user) throw new UnauthorizedException();

      user.password = await this.createPassword(password);
      user.passwordResetToken = null;
      user.updatedAt = new Date().toISOString();

      await queryRunner.manager.save(user);
      return queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
