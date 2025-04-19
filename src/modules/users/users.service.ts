import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { UploadApiOptions } from "cloudinary";
import { instanceToInstance } from "class-transformer";

import { Role } from "src/types";
import { errorMessages } from "src/utils";

import { InstanceService } from "src/common/services";
import { UserDto } from "src/common/dto";

import { CloudinaryService } from "../cloudinary/cloudinary.service";

import { UserEntity } from "./user.entity";
import { UpdateUserDto } from "./dto";

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
    private readonly cloudinaryService: CloudinaryService,
    private dataSource: DataSource
  ) {
    super(user);
  }

  private async uploadAvatar(id: number, avatar: Express.Multer.File) {
    const response = await this.cloudinaryService.upload(avatar.path, {
      ...avatarUploadOption,
      public_id: id.toString(),
    });
    const url = this.cloudinaryService.edit(response.secure_url, {
      fetch_format: "auto",
      quality: "auto",
    });
    return { url, pId: response.public_id };
  }

  private async findUserById(id: number, queryRunner: QueryRunner) {
    const user = await queryRunner.manager.findOneBy(UserEntity, { id });
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async getUser(id: number) {
    const user = await this.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return instanceToInstance(user);
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = new UserEntity(userDto);
      user.password = await this.createPassword(password);
      if (role) user.role = role;

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return instanceToInstance(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateUser(
    id: number,
    { username }: UpdateUserDto,
    avatar?: Express.Multer.File,
    role?: Role
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.findUserById(id, queryRunner);

      if (role === Role.Admin && user.role !== Role.User) {
        throw new ForbiddenException();
      }

      user.username = username;

      if (avatar) {
        const { url } = await this.uploadAvatar(id, avatar);
        user.avatar = url;
      }

      user.updatedAt = new Date().toISOString();

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return instanceToInstance(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addOrChangeAvatar(id: number, avatar: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.findUserById(id, queryRunner);

      const { url } = await this.uploadAvatar(id, avatar);
      user.avatar = url;
      user.updatedAt = new Date().toISOString();

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return instanceToInstance(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAvatar(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.findUserById(id, queryRunner);

      if (!user.avatar) {
        throw new BadRequestException(errorMessages.avatar.deleted);
      }

      await this.cloudinaryService.delete(user.avatar);
      user.avatar = null;
      user.updatedAt = new Date().toISOString();

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return instanceToInstance(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUser(id: number, admin: { id: number; role: Role }) {
    if (id === admin.id) throw new ForbiddenException();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.findUserById(id, queryRunner);

      if (admin.role === Role.Admin && user.role !== Role.User) {
        throw new ForbiddenException();
      }

      if (user.avatar) {
        await this.cloudinaryService.delete(user.avatar);
      }

      await queryRunner.manager.delete(UserEntity, user.id);
      return await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
