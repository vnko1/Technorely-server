import { z } from "zod";

import { UserSchema } from "src/common/dto";
import { errorMessages } from "src/utils";

export const CreateUserSchema = UserSchema;

export const UpdateUserSchema = z.object({
  username: z.string({ required_error: errorMessages.username.required }),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
