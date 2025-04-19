import { z } from "zod";

export const BaseQueySchema = z.object({
  offset: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  sort: z.enum(["ASC", "DESC"]).optional(),
});

export type BaseQueryDto = z.infer<typeof BaseQueySchema>;
