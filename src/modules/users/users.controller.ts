import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

import { Role } from "src/types";
import {
  MAX_PROFILE_PICTURE_SIZE_IN_BYTES,
  storageConfig,
  VALID_UPLOADS_MIME_TYPES,
} from "src/utils";
import { Roles, User } from "src/common/decorators";
import { CustomValidationPipe } from "src/common/pipes";
import { ClearDataInterceptor } from "src/common/interceptors";

import { UsersService } from "./users.service";
import {
  CreateUserDto,
  CreateUserSchema,
  UpdateUserDto,
  UpdateUserSchema,
} from "./dto";
import { UploadFileTypeValidator } from "src/common/validators";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@User("id") id: number) {
    return this.usersService.getUser(id);
  }

  @Patch("me")
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: diskStorage(storageConfig),
    }),
    ClearDataInterceptor
  )
  @UsePipes(new CustomValidationPipe<UpdateUserDto>(UpdateUserSchema))
  updateMe(
    @User("id") id: number,
    @Body()
    dto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new UploadFileTypeValidator({ fileType: VALID_UPLOADS_MIME_TYPES })
        )
        .addMaxSizeValidator({
          maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES,
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    )
    avatar?: Express.Multer.File
  ) {
    return this.usersService.updateUser(id, dto, avatar);
  }

  @Put("me/avatar")
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: diskStorage(storageConfig),
    }),
    ClearDataInterceptor
  )
  addOrChangeAvatar(
    @User("id") id: number,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new UploadFileTypeValidator({ fileType: VALID_UPLOADS_MIME_TYPES })
        )
        .addMaxSizeValidator({
          maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    )
    image: Express.Multer.File
  ) {
    return this.usersService.addOrChangeAvatar(id, image);
  }

  @Delete("me/avatar")
  deleteAvatar(@User("id") id: number) {
    return this.usersService.deleteAvatar(id);
  }

  @Post("admin")
  @Roles(Role.SuperAdmin)
  @UsePipes(new CustomValidationPipe<CreateUserDto>(CreateUserSchema))
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }
}
