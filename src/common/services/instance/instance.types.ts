import {
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectId,
  RemoveOptions,
  SaveOptions,
  UpdateResult,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export type CriteriaType<T> =
  | string
  | number
  | Date
  | ObjectId
  | FindOptionsWhere<T>
  | string[]
  | number[]
  | Date[]
  | ObjectId[];

export type EntityType<T> = QueryDeepPartialEntity<T>;

export interface InstanceInterface<T> {
  findAll(opt?: FindManyOptions): Promise<T[]>;
  findAllAndCount(opt?: FindManyOptions): Promise<[T[], number]>;
  findAllBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]>;
  findAllAndCountBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[]
  ): Promise<[T[], number]>;
  findOneBy(
    opt: FindOptionsWhere<T> | FindOptionsWhere<T>[]
  ): Promise<T | null>;
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  save(entity: T, opt?: SaveOptions): Promise<T>;
  create(data: T): T;
  update(
    criteria: CriteriaType<T>,
    entity: EntityType<T>
  ): Promise<UpdateResult>;
  delete(criteria: CriteriaType<T>): Promise<DeleteResult>;
  softDelete(criteria: CriteriaType<T>): Promise<UpdateResult>;
  remove(entities: T[], opt?: RemoveOptions): Promise<T[]>;
  softRemove(entities: T[], opt?: SaveOptions): Promise<T[]>;
  restore(criteria: CriteriaType<T>): Promise<UpdateResult>;
}
