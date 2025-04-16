import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { Roles, User } from "src/common/decorators";

import { Role } from "src/types";
import { CustomValidationPipe } from "src/common/pipes";

import { UsersService } from "./users.service";
import {
  CreateUserDto,
  CreateUserSchema,
  UpdateUserDto,
  UpdateUserSchema,
} from "./dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { storageConfig } from "src/utils";
import { ClearDataInterceptor } from "src/common/interceptors";

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
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          // new FileTypeValidator({ fileType: /image\/(jpg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      })
    )
    avatar?: Express.Multer.File
  ) {
    if (!avatar && !dto.username) throw new BadRequestException();

    return this.usersService.updateUser(id, dto, avatar);
  }

  @Post("admin")
  @Roles(Role.SuperAdmin)
  @UsePipes(new CustomValidationPipe<CreateUserDto>(CreateUserSchema))
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }
}
