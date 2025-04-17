import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { CookieOptions } from "express";

export abstract class AppService {
  protected cookieOptions: CookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sameSite: "none",
    secure: true,
  };
  protected async checkPass(pass: string, hash: string) {
    try {
      return await bcrypt.compare(pass, hash);
    } catch {
      return false;
    }
  }

  protected async createPassword(pass: string) {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(pass, salt);
  }
  protected randomString(size = 20) {
    return randomBytes(size).toString("hex");
  }
}
