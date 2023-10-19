import { NextFunction, Request, Response } from "express";
import { FindOptionsWhere, Repository } from "typeorm";
import { responseError } from "../auth/utils/responseError";

type Params = { id: number; res: Response };

export abstract class EntityControllerBase<TEntity> {
  protected repository: Repository<TEntity>;

  constructor(repository: Repository<TEntity>) {
    this.repository = repository;
  }

  async create({ res }: Params, entity: TEntity): Promise<TEntity> {
    const newEntity = this.repository.create(entity);
    const createdEntity = await this.repository.save(newEntity);
    return createdEntity;
  }

  async all(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entities = await this.repository.find();
      res.json(entities);
    } catch (error) {
      console.error("Error fetching entities:", error);
      res.status(500).json({ message: "Error fetching entities" });
    }
  }

  async one({ id, res }: Params): Promise<TEntity> {
    const options = { id } as unknown as FindOptionsWhere<TEntity>;
    const entity = await this.repository.findOneBy(options);

    if (!entity) responseError(res, "Entity not found.", 404);

    return entity;
  }

  async update({ id, res }: Params, entity: TEntity): Promise<TEntity> {
    const options = { id } as unknown as FindOptionsWhere<TEntity>;
    const entityToUpdate = await this.repository.findOneBy(options);
    console.log(entity.constructor.name);

    if (!entityToUpdate) responseError(res, "Entity not found.", 404);

    const userUpdate = { ...entityToUpdate, ...entity };
    return await this.repository.save(userUpdate);
  }

  async delete({ id, res }: Params): Promise<TEntity> {
    const options = { id } as unknown as FindOptionsWhere<TEntity>;
    const entity = await this.repository.findOneBy(options);

    if (!entity) responseError(res, "Entity not found.", 404);

    return await this.repository.remove(entity);
  }
}
