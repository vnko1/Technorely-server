import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, DataSource, Not, QueryRunner, Repository } from "typeorm";
import { UploadApiOptions } from "cloudinary";
import { instanceToPlain } from "class-transformer";
import { endOfDay, startOfDay } from "date-fns";

import { IUser, LogsAction, Role } from "src/types";
import { errorMessages } from "src/utils";

import { InstanceService } from "src/common/services";
import { UserDto } from "src/common/dto";

import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { ActionLogsService } from "../actionLogs/actionLogs.service";

import { UserEntity } from "./user.entity";
import { UpdateUserDto, UserQueryDto } from "./dto";

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
    @Inject(forwardRef(() => ActionLogsService))
    private readonly logsService: ActionLogsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource
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
    return instanceToPlain(user);
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

      await this.logsService.log(
        {
          action: LogsAction.CREATE,
          userId: user.id,
          entityName: "User",
          metadata: { reason: `Created ${user.role}` },
        },
        queryRunner
      );

      await queryRunner.commitTransaction();
      return instanceToPlain(user);
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
    let publicId: string | null = null;
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
        const { url, pId } = await this.uploadAvatar(id, avatar);
        user.avatar = url;
        publicId = pId;
      }

      user.updatedAt = new Date().toISOString();

      await queryRunner.manager.save(user);

      await this.logsService.log(
        {
          action: LogsAction.UPDATE,
          userId: user.id,
          entityName: "User",
          metadata: { reason: `Updated ${user.role}` },
        },
        queryRunner
      );

      await queryRunner.commitTransaction();
      return instanceToPlain(user);
    } catch (error) {
      if (publicId) await this.cloudinaryService.delete(publicId);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addOrChangeAvatar(id: number, avatar: Express.Multer.File) {
    let publicId: string | null = null;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.findUserById(id, queryRunner);

      const { url, pId } = await this.uploadAvatar(id, avatar);
      publicId = pId;
      user.avatar = url;

      user.updatedAt = new Date().toISOString();

      await this.logsService.log(
        {
          action: LogsAction.UPDATE,
          userId: user.id,
          entityName: "User",
          metadata: { reason: `Update ${user.role} avatar` },
        },
        queryRunner
      );

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return instanceToPlain(user);
    } catch (error) {
      if (publicId) await this.cloudinaryService.delete(publicId);
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

      await this.logsService.log(
        {
          action: LogsAction.DELETE,
          userId: user.id,
          entityName: "User",
          metadata: { reason: `Deleted ${user.role} avatar` },
        },
        queryRunner
      );

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return instanceToPlain(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUser(id: number, admin: IUser) {
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

      await this.logsService.log(
        {
          action: LogsAction.DELETE,
          userId: user.id,
          entityName: "User",
          metadata: { reason: `Deleted ${user.role}` },
        },
        queryRunner
      );

      await queryRunner.manager.delete(UserEntity, user.id);
      return await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUsers(admin: IUser, query: UserQueryDto) {
    const {
      createdAt,
      updatedAt,
      offset = 0,
      limit = 10,
      sort = "ASC",
      email,
      username,
    } = query;
    const queryParam: Record<string, unknown> = {};
    if (email) {
      queryParam.email = email;
    }
    if (username) {
      queryParam.username = username;
    }

    if (createdAt) {
      queryParam.createdAt = Between(
        startOfDay(createdAt),
        endOfDay(createdAt)
      );
    }

    if (updatedAt) {
      queryParam.updatedAt = Between(
        startOfDay(updatedAt),
        endOfDay(updatedAt)
      );
    }

    if (admin.role === Role.Admin) {
      queryParam.role = Role.User;
    }

    if (admin.role === Role.SuperAdmin) {
      queryParam.role = Not(Role.SuperAdmin);
    }

    const [users, total] = await this.findAllAndCount({
      where: queryParam,
      order: { id: sort },
      skip: offset,
      take: limit,
    });
    return { date: instanceToPlain(users), meta: { total, offset, limit } };
  }
}
