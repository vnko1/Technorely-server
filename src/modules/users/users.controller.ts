import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

import { IUser, Role } from "src/types";
import { storageConfig, uploadValidation } from "src/utils";
import { Roles, User } from "src/common/decorators";
import { CustomValidationPipe } from "src/common/pipes";
import { ClearDataInterceptor } from "src/common/interceptors";

import { UsersService } from "./users.service";
import {
  CreateUserDto,
  CreateUserSchema,
  UpdateUserDto,
  UpdateUserSchema,
  UserQueryDto,
  UserQuerySchema,
} from "./dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SuperAdmin, Role.Admin)
  @UsePipes(new CustomValidationPipe<UserQueryDto>(UserQuerySchema, "query"))
  getAllUsers(@Query() query: UserQueryDto, @User() admin: IUser) {
    return this.usersService.getUsers(admin, query);
  }

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
    @UploadedFile(uploadValidation())
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
    @UploadedFile(uploadValidation(true))
    avatar: Express.Multer.File
  ) {
    return this.usersService.addOrChangeAvatar(id, avatar);
  }

  @Delete("me/avatar")
  deleteAvatar(@User("id") id: number) {
    return this.usersService.deleteAvatar(id);
  }

  @Post("admin")
  @Roles(Role.SuperAdmin, Role.Admin)
  @UsePipes(new CustomValidationPipe<CreateUserDto>(CreateUserSchema))
  createUser(@User("role") role: Role, @Body() dto: CreateUserDto) {
    if (role === Role.Admin && dto.role !== Role.User) {
      throw new BadRequestException();
    }

    return this.usersService.addUser(dto);
  }

  @Patch("admin/:id")
  @Roles(Role.SuperAdmin, Role.Admin)
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: diskStorage(storageConfig),
    }),
    ClearDataInterceptor
  )
  @UsePipes(new CustomValidationPipe<UpdateUserDto>(UpdateUserSchema))
  updateUser(
    @User("role") role: Role,
    @Param("id", ParseIntPipe) id: number,
    @Body()
    dto: UpdateUserDto,
    @UploadedFile(uploadValidation())
    avatar?: Express.Multer.File
  ) {
    return this.usersService.updateUser(id, dto, avatar, role);
  }

  @Delete("admin/:id")
  @Roles(Role.SuperAdmin, Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param("id", ParseIntPipe) id: number, @User() admin: IUser) {
    return this.usersService.deleteUser(id, admin);
  }
}
