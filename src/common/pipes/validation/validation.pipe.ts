import {
  PipeTransform,
  BadRequestException,
  ArgumentMetadata,
} from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";

type SchemaType<T> = ZodSchema<T>;
type ValidationType = "body" | "query" | "param" | "custom";

export class CustomValidationPipe<T> implements PipeTransform {
  constructor(
    private readonly schema: SchemaType<T>,
    private readonly type: ValidationType = "body"
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      if (metadata.type === this.type) {
        return this.schema.parse(value);
      }

      return value as unknown;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.errors[0].message);
      }

      throw new BadRequestException("Validation failed:" + " " + error);
    }
  }
}
