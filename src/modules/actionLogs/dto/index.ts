import { z } from "zod";

import { BaseQueySchema } from "src/common/dto";

export const LogsQuerySchema = z
  .object({
    action: z.string().optional(),
    entityName: z.number().optional(),
  })
  .merge(BaseQueySchema);

export type LogsQueryDto = z.infer<typeof LogsQuerySchema>;
