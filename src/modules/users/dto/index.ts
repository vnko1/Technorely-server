import { z } from "zod";

import { BaseQueySchema, UserSchema } from "src/common/dto";
import { errorMessages } from "src/utils";

export const CreateUserSchema = UserSchema;

export const UpdateUserSchema = z.object({
  username: z.string({ required_error: errorMessages.username.required }),
});

export const UserQuerySchema = z
  .object({
    email: z.string().optional(),
    username: z.number().optional(),
  })
  .merge(BaseQueySchema);

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserQueryDto = z.infer<typeof UserQuerySchema>;
