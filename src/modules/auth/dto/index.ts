import { z } from "zod";

import { errorMessages } from "src/utils";
import { UserSchema } from "src/common/dto";

export const AuthSchema = UserSchema.omit({ role: true });

export const ResetPasswordSchema = AuthSchema.pick({ email: true });

export const VerifyPasswordSchema = z
  .object({
    passwordResetToken: z.string({
      required_error: errorMessages.password.token,
    }),
  })
  .merge(AuthSchema.pick({ password: true }));

export type AuthDto = z.infer<typeof AuthSchema>;
export type VerifyPasswordDto = z.infer<typeof VerifyPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
