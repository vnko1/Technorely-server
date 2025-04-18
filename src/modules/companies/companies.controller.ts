import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";

import { CustomValidationPipe } from "src/common/pipes";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto, CreateCompanySchema } from "./dto";
import { User } from "src/common/decorators";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @UsePipes(new CustomValidationPipe<CreateCompanyDto>(CreateCompanySchema))
  createCompany(
    @User("id") id: number,
    @Body() createCompanyDto: CreateCompanyDto
  ) {
    return this.companiesService.createCompany(createCompanyDto, id);
  }

  @Get()
  getCompanies() {
    return 1;
  }
}
