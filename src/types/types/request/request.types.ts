import { Request } from "express";

export type EntityType = Record<string, unknown>;

export interface IRequest extends Request {
  user?: EntityType;
}
