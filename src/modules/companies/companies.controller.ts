import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { diskStorage } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";

import { storageConfig, uploadValidation } from "src/utils";
import { Role } from "src/types";
import { User } from "src/common/decorators";
import { ClearDataInterceptor } from "src/common/interceptors";
import { CustomValidationPipe } from "src/common/pipes";

import { CompaniesService } from "./companies.service";
import {
  CreateCompanyDto,
  CreateCompanySchema,
  UpdateCompanyDto,
  UpdateCompanySchema,
} from "./dto";

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
  @UseInterceptors(
    FileInterceptor("logo", {
      storage: diskStorage(storageConfig),
    }),
    ClearDataInterceptor
  )
  @UsePipes(new CustomValidationPipe<UpdateCompanyDto>(UpdateCompanySchema))
  updateCompany(
    @Param("id", ParseIntPipe) id: number,
    @User() user: { id: number; role: Role },
    @Body() compantDto: UpdateCompanyDto,
    @UploadedFile(uploadValidation())
    logo?: Express.Multer.File
  ) {
    return this.companiesService.updateCompany(id, user);
  }

  @Get()
  getCompanies() {
    return 1;
  }
}
