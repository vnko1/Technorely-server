// * SEQUELIZE
// export abstract class InstanceService<TModel extends Model>
//   implements InstanceInterface<TModel>
// {
//   constructor(private readonly model: ModelStatic<TModel>) {
//     super();
//   }

//   add(data: any, opt?: CreateOptions): Promise<TModel> {
//     return this.model.create(data, opt);
//   }

//   edit<T extends object>(
//     data: T,
//     opt: UpdateOptions,
//   ): Promise<[affectedCount: number]> {
//     return this.model.update(data, opt);
//   }

//   delete(opt: DestroyOptions): Promise<number> {
//     return this.model.destroy(opt);
//   }

//   findByPk<M extends string | number>(
//     pk: M,
//     opt?: FindOptions,
//   ): Promise<TModel> {
//     return this.model.findByPk(pk, opt);
//   }

//   findOne(opt?: FindOptions): Promise<TModel> {
//     return this.model.findOne(opt);
//   }

//   findAll(opt?: FindOptions): Promise<TModel[]> {
//     return this.model.findAll(opt);
//   }

//   findAndCountAll(
//     opt?: Omit<FindAndCountOptions<any>, 'group'>,
//   ): Promise<{ rows: TModel[]; count: number }> {
//     return this.model.findAndCountAll(opt);
//   }
// }

// * TYPEORM
// export abstract class InstanceService<T extends ObjectLiteral>
//   implements InstanceInterface<T>
// {
//   constructor(private readonly repository: Repository<T>) {}

//   findAll(options?: FindManyOptions) {
//     return this.repository.find(options);
//   }

//   findAllBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
//     return this.repository.findBy(where);
//   }

//   findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
//     return this.repository.findOneBy(where);
//   }

//   findOne(where: FindOneOptions<T>) {
//     return this.repository.findOne(where);
//   }

//   findAllAndCount(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
//     return this.repository.findAndCountBy(where);
//   }

//   save(entity: T, opt?: SaveOptions) {
//     return this.repository.save(entity, opt);
//   }

//   create(data: T) {
//     return this.repository.create(data);
//   }

//   update(criteria: CriteriaType<T>, entity: EntityType<T>) {
//     return this.repository.update(criteria, entity);
//   }

//   delete(criteria: CriteriaType<T>) {
//     return this.repository.delete(criteria);
//   }

//   softDelete(criteria: CriteriaType<T>) {
//     return this.repository.softDelete(criteria);
//   }

//   remove(entities: T[], opt?: RemoveOptions) {
//     return this.repository.remove([...entities], opt);
//   }

//   softRemove(entities: T[], opt?: SaveOptions) {
//     return this.repository.softRemove([...entities], opt);
//   }

//   restore(criteria: CriteriaType<T>) {
//     return this.repository.restore(criteria);
//   }
// }
