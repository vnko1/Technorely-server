import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UploadApiOptions } from "cloudinary";
import { instanceToInstance } from "class-transformer";

import { InstanceService } from "src/common/services";

import { CloudinaryService } from "../cloudinary/cloudinary.service";

import { UserEntity } from "./user.entity";
import { CreateUserDto, UpdateUserDto } from "./dto";

const fileUploadOption: UploadApiOptions = {
  resource_type: "image",
  folder: "balancy/avatar",
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
    const user = await this.findOneBy({ id });
    if (!user) {
      throw new NotFoundException();
    }

    if (username) user.username = username;

    if (avatar) {
      const response = await this.cloudinaryService.upload(avatar.path, {
        ...fileUploadOption,
        public_id: id.toString(),
      });

      user.avatar = this.cloudinaryService.edit(response.secure_url, {
        fetch_format: "auto",
        quality: "auto",
      });
    }
    user.updatedAt = new Date().toISOString();

    const updatedUser = await this.save(user);
    return instanceToInstance(updatedUser);
  }

  deleteUser(id: number) {}
}
