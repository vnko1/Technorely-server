import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  RemoveOptions,
  Repository,
  SaveOptions,
} from "typeorm";
import { CriteriaType, EntityType, InstanceInterface } from "./instance.types";
import { AppService } from "../app/app.service";

export abstract class InstanceService<T extends ObjectLiteral>
  extends AppService
  implements InstanceInterface<T>
{
  constructor(private readonly repository: Repository<T>) {
    super();
  }

  findAll(options?: FindManyOptions) {
    return this.repository.find(options);
  }
  findAllAndCount(opt?: FindManyOptions) {
    return this.repository.findAndCount(opt);
  }

  findAllBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
    return this.repository.findBy(where);
  }

  findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
    return this.repository.findOneBy(where);
  }

  findOne(where: FindOneOptions<T>) {
    return this.repository.findOne(where);
  }

  findAllAndCountBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
    return this.repository.findAndCountBy(where);
  }

  save(entity: T, opt?: SaveOptions) {
    return this.repository.save(entity, opt);
  }

  create(data: T) {
    return this.repository.create(data);
  }

  update(criteria: CriteriaType<T>, entity: EntityType<T>) {
    return this.repository.update(criteria, entity);
  }

  delete(criteria: CriteriaType<T>) {
    return this.repository.delete(criteria);
  }

  softDelete(criteria: CriteriaType<T>) {
    return this.repository.softDelete(criteria);
  }

  remove(entities: T[], opt?: RemoveOptions) {
    return this.repository.remove([...entities], opt);
  }

  softRemove(entities: T[], opt?: SaveOptions) {
    return this.repository.softRemove([...entities], opt);
  }

  restore(criteria: CriteriaType<T>) {
    return this.repository.restore(criteria);
  }
}
