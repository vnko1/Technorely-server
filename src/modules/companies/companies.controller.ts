import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
} from "@nestjs/common";

import { User } from "src/common/decorators";
import { CustomValidationPipe } from "src/common/pipes";

import { CompaniesService } from "./companies.service";
import { CreateCompanyDto, CreateCompanySchema } from "./dto";
import { Role } from "src/types";

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

  @Patch(":id")
  updateCompany(
    @Param("id", ParseIntPipe) id: number,
    @User() user: { id: number; role: Role }
  ) {
    return this.companiesService.updateCompany(id, user);
  }

  @Get()
  getCompanies() {
    return 1;
  }
}
