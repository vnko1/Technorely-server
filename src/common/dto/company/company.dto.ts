import { z } from "zod";

import { errorMessages } from "src/utils";

export const CompanySchema = z.object({
  name: z.string({
    required_error: errorMessages.company.name.required,
  }),
  service: z.string({
    required_error: errorMessages.company.service.required,
  }),
  capital: z.string({
    required_error: errorMessages.company.capital.required,
  }),
  price: z.number({
    required_error: errorMessages.company.capital.required,
  }),
});

export type CompanyDto = z.infer<typeof CompanySchema>;
