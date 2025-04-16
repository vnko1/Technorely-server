import { z } from "zod";

import { UserSchema } from "src/common/dto";

export const CreateUserSchema = UserSchema;

export const UpdateUserSchema = z.object({
  username: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
