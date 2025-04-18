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

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;
