import { NextFunction, Request, Response } from "express";
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from "typeorm";
import { responseError } from "../errors/responseError";
import { createFindOptions } from "./utils/createFindOptions";

type Params = {
  id: number;
  req?: Request;
  res: Response;
  next?: NextFunction;
};

export abstract class EntityControllerBase<TEntity> {
  protected repository: Repository<TEntity>;
  protected entityName: string;

  constructor(repository: Repository<TEntity>) {
    this.repository = repository;
    this.entityName = this.constructor.name;
  }

  async create(entity: TEntity): Promise<TEntity> {
    const newEntity = this.repository.create(entity);
    const createdEntity = await this.repository.save(newEntity);

    return createdEntity;
  }

  async all(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options: FindManyOptions<TEntity> = createFindOptions(req);

      const entities = await this.repository.find(options);
      res.json(entities);
    } catch (error) {
      console.error(
        `Error fetching ${this.entityName
          .toUpperCase()
          .replace("CONTROLLER", "")} entities:`,
        error
      );
      res.status(500).json({
        message: `Error fetching ${this.entityName
          .toUpperCase()
          .replace("CONTROLLER", "")} entities.`,
      });
    }
  }

  async one({ id, req, res }: Params): Promise<TEntity> {
    const options: FindOneOptions<TEntity> = createFindOptions(req, {
      where: { id },
    });

    const entity = await this.repository.findOne(options);

    if (!entity)
      responseError(
        res,
        `Entity ${this.entityName
          .toUpperCase()
          .replace("CONTROLLER", "")} not found.`,
        404
      );

    return entity;
  }

  async update({ id, res }: Params, entity: TEntity): Promise<TEntity> {
    const options = { id } as unknown as FindOptionsWhere<TEntity>;
    const entityToUpdate = await this.repository.findOneBy(options);

    if (!entityToUpdate)
      responseError(
        res,
        `Entity ${this.entityName
          .toUpperCase()
          .replace("CONTROLLER", "")} not found.`,
        404
      );

    const entityUpdate = this.repository.create({
      ...entityToUpdate,
      ...entity,
    });
    return await this.repository.save(entityUpdate);
  }

  async delete({ id, res }: Params): Promise<TEntity> {
    const options = { id } as unknown as FindOptionsWhere<TEntity>;
    const entity = await this.repository.findOneBy(options);

    if (!entity)
      responseError(
        res,
        `Entity ${this.entityName
          .toUpperCase()
          .replace("CONTROLLER", "")} not found.`,
        404
      );

    return await this.repository.remove(entity);
  }

  async deleteOptions(
    options: FindOneOptions<TEntity>,
    res: Response
  ): Promise<TEntity> {
    const entity = await this.repository.findOne(options);

    if (!entity)
      responseError(
        res,
        `Entity ${this.entityName
          .toUpperCase()
          .replace("CONTROLLER", "")} not found.`,
        404
      );

    return await this.repository.remove(entity);
  }
}
