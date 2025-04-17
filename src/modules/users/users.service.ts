import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UploadApiOptions } from "cloudinary";
import { instanceToInstance } from "class-transformer";

import { errorMessages } from "src/utils";
import { InstanceService } from "src/common/services";
import { UserDto } from "src/common/dto";

import { CloudinaryService } from "../cloudinary/cloudinary.service";

import { UserEntity } from "./user.entity";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { Role } from "src/types";

const avatarUploadOption: UploadApiOptions = {
  resource_type: "image",
  folder: "technorely/avatars",
  overwrite: true,
};

@Injectable()
export class UsersService extends InstanceService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    user: Repository<UserEntity>,
    private readonly cloudinaryService: CloudinaryService
  ) {
    super(user);
  }

  private async findUserById(id: number) {
    const user = await this.findOneBy({ id });
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  private async uploadAvatar(id: number, avatar: Express.Multer.File) {
    const response = await this.cloudinaryService.upload(avatar.path, {
      ...avatarUploadOption,
      public_id: id.toString(),
    });

    return this.cloudinaryService.edit(response.secure_url, {
      fetch_format: "auto",
      quality: "auto",
    });
  }

  async addUser(
    userDto: Pick<UserDto, "email" | "password"> &
      Partial<Pick<UserDto, "role">>
  ) {
    const { email, password, role } = userDto;

    const isUserExist = await this.findOne({
      where: { email },
      withDeleted: true,
    });

    if (isUserExist) throw new ForbiddenException(errorMessages.email.exist);

    const user = new UserEntity(userDto);
    user.password = await this.createPassword(password);
    if (role) user.role = role;
    return this.save(user);
  }

  async getUser(id: number) {
    const user = await this.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return instanceToInstance(user);
  }

  async updateUser(
    id: number,
    { username }: UpdateUserDto,
    avatar?: Express.Multer.File,
    role?: Role
  ) {
    const user = await this.findUserById(id);

    if (role === Role.Admin && user.role !== Role.User) {
      throw new ForbiddenException();
    }

    user.username = username;

    if (avatar) {
      const avatarUrl = await this.uploadAvatar(id, avatar);
      user.avatar = avatarUrl;
    }

    user.updatedAt = new Date().toISOString();

    const updatedUser = await this.save(user);
    return instanceToInstance(updatedUser);
  }

  async addOrChangeAvatar(id: number, avatar: Express.Multer.File) {
    const user = await this.findUserById(id);
    const avatarUrl = await this.uploadAvatar(id, avatar);
    user.avatar = avatarUrl;
    user.updatedAt = new Date().toISOString();

    const updatedUser = await this.save(user);
    return instanceToInstance(updatedUser);
  }

  async deleteAvatar(id: number) {
    const user = await this.findUserById(id);
    if (!user.avatar) {
      throw new BadRequestException("Avatar is already deleted");
    }

    await this.cloudinaryService.delete(user.avatar);
    user.avatar = null;
    user.updatedAt = new Date().toISOString();

    const updatedUser = await this.save(user);
    return instanceToInstance(updatedUser);
  }

  async createUser(userDto: CreateUserDto) {
    const user = await this.addUser(userDto);
    return instanceToInstance(user);
  }

  async deleteUser(id: number, admin: { id: number; role: Role }) {
    if (id === admin.id) throw new ForbiddenException();

    const user = await this.findUserById(id);
    if (admin.role === Role.Admin && user.role !== Role.User) {
      throw new ForbiddenException();
    }

    if (user.avatar) {
      await this.cloudinaryService.delete(user.avatar);
    }

    return this.delete(user.id);
  }
}
