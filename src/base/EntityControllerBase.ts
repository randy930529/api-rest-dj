import { NextFunction, Request, Response } from "express";
import { FindOptionsWhere, Repository } from "typeorm";

export abstract class EntityControllerBase<TEntity> {
  protected repository: Repository<TEntity>;

  constructor(repository: Repository<TEntity>) {
    this.repository = repository;
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entity = this.repository.create(req.body);
      const createdEntity = await this.repository.save(entity);
      res.status(201).json(createdEntity);
    } catch (error) {
      console.error("Error creating entity:", error);
      res.status(500).json({ message: "Error creating entity" });
    }
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

  async one(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const options = { id } as unknown as FindOptionsWhere<TEntity>;

      const entity = await this.repository.findOneBy(options);
      if (!entity) {
        res.status(404).json({ message: "Entity not found" });
      } else {
        res.json(entity);
      }
    } catch (error) {
      console.error("Error fetching entity:", error);
      res.status(500).json({ message: "Error fetching entity" });
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const options = { id } as unknown as FindOptionsWhere<TEntity>;

      const entity = await this.repository.findOneBy(options);
      if (!entity) {
        res.status(404).json({ message: "Entity not found" });
      } else {
        this.repository.merge(entity, req.body);
        const updatedEntity = await this.repository.save(entity);
        res.json(updatedEntity);
      }
    } catch (error) {
      console.error("Error updating entity:", error);
      res.status(500).json({ message: "Error updating entity" });
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const options = { id } as unknown as FindOptionsWhere<TEntity>;

      const entity = await this.repository.findOneBy(options);
      if (!entity) {
        res.status(404).json({ message: "Entity not found" });
      } else {
        await this.repository.remove(entity);
        res.json({ message: "Entity deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting entity:", error);
      res.status(500).json({ message: "Error deleting entity" });
    }
  }
}
