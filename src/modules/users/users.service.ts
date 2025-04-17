import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UploadApiOptions } from "cloudinary";
import { instanceToInstance } from "class-transformer";

import { InstanceService } from "src/common/services";

import { CloudinaryService } from "../cloudinary/cloudinary.service";

import { UserEntity } from "./user.entity";
import { CreateUserDto, UpdateUserDto } from "./dto";

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

  async getUser(id: number) {
    const user = await this.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return instanceToInstance(user);
  }

  createUser(dto: CreateUserDto) {
    return dto;
  }

  async updateUser(
    id: number,
    { username }: UpdateUserDto,
    avatar?: Express.Multer.File
  ) {
    const user = await this.findUserById(id);

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

  deleteUser(id: number) {}
}
