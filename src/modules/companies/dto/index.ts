import { z } from "zod";
import { CompanySchema } from "src/common/dto";
import { errorMessages } from "src/utils";

export const CreateCompanySchema = CompanySchema;

export const UpdateCompanySchema = CompanySchema.partial().refine(
  (data) => Object.values(data).some((value) => value !== undefined),
  {
    message: errorMessages.company.update,
  }
);

export const QuerySchema = z.object({
  name: z.enum(["asc", "desc"]).optional(),
  service: z.enum(["asc", "desc"]).optional(),
  capital: z.string().optional(),
  price: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  offset: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;
export type QueryDto = z.infer<typeof QuerySchema>;
