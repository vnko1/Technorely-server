import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { CookieOptions } from "express";
import { UploadFileTypeValidator } from "src/common/validators";
import {
  MAX_PROFILE_PICTURE_SIZE_IN_BYTES,
  VALID_UPLOADS_MIME_TYPES,
} from "src/utils";

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

  protected parseData<T extends object>(
    entity: T,
    data: Record<string, unknown>
  ) {
    Object.entries(data).forEach(([key, value]) => (entity[key] = value));
  }

  uploadValidation = (fileIsRequired = false) =>
    new ParseFilePipeBuilder()
      .addValidator(
        new UploadFileTypeValidator({ fileType: VALID_UPLOADS_MIME_TYPES })
      )
      .addMaxSizeValidator({
        maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES,
      })
      .build({
        fileIsRequired,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
}
