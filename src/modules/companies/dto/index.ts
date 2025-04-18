import { z } from "zod";
import { CompanySchema } from "src/common/dto";

export const CreateCompanySchema = CompanySchema;

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;
