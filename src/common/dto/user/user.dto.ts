import { z } from "zod";

import { passwordRegex, errorMessages } from "src/utils";
import { Role } from "src/types";

export const UserSchema = z.object({
  email: z
    .string({
      required_error: errorMessages.email.required,
    })
    .email(),
  password: z
    .string({
      required_error: errorMessages.password.required,
    })
    .min(8, errorMessages.password.requirement)
    .max(30, errorMessages.password.requirement)
    .regex(passwordRegex, errorMessages.password.requirement),
  role: z.enum([Role.Admin, Role.User], {
    required_error: errorMessages.role.required,
  }),
});
