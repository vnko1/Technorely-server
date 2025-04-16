import {
  PipeTransform,
  BadRequestException,
  ArgumentMetadata,
} from "@nestjs/common";

type SchemaType<T> = T; //* Add schema validator (type SchemaType<T> = ZodSchema<T>)
type ValidationType = "body" | "query" | "param" | "custom";

export class CustomValidationPipe<T> implements PipeTransform {
  constructor(
    private readonly schema: SchemaType<T>,
    private readonly type: ValidationType = "body"
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      if (metadata.type === this.type) {
        //* Add validation logic
        return value as T;
      }

      return value as unknown;
    } catch (error) {
      //* Add validation error handler
      throw new BadRequestException("Validation failed:" + " " + error);
    }
  }
}
