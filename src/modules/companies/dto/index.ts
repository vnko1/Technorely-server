import { z } from "zod";
import { CompanySchema, BaseQueySchema } from "src/common/dto";
import { errorMessages } from "src/utils";

export const CreateCompanySchema = CompanySchema;

export const UpdateCompanySchema = CompanySchema.partial().refine(
  (data) => Object.values(data).some((value) => value !== undefined),
  {
    message: errorMessages.company.update,
  }
);

export const CompaniesQuerySchema = z
  .object({
    name: z.enum(["ASC", "DESC"]).optional(),
    service: z.enum(["ASC", "ASC"]).optional(),
    capital: z.coerce.number().optional(),
  })
  .merge(BaseQueySchema);

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;
export type CompaniesQueryDto = z.infer<typeof CompaniesQuerySchema>;
