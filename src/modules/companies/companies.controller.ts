import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  Query,
} from "@nestjs/common";
import { diskStorage } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";

import { storageConfig, uploadValidation } from "src/utils";
import { IUser, Role } from "src/types";

import { Roles, User } from "src/common/decorators";
import { ClearDataInterceptor } from "src/common/interceptors";
import { CustomValidationPipe } from "src/common/pipes";

import { CompaniesService } from "./companies.service";
import {
  CreateCompanyDto,
  CreateCompanySchema,
  CompaniesQueryDto,
  CompaniesQuerySchema,
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
    @User() user: IUser,
    @Body() companyDto: UpdateCompanyDto,
    @UploadedFile(uploadValidation())
    logo?: Express.Multer.File
  ) {
    return this.companiesService.updateCompany(id, user, companyDto, logo);
  }

  @Put("company/:id/logo")
  @UseInterceptors(
    FileInterceptor("logo", {
      storage: diskStorage(storageConfig),
    }),
    ClearDataInterceptor
  )
  addOrChangeLogo(
    @Param("id", ParseIntPipe) id: number,
    @User() user: IUser,
    @UploadedFile(uploadValidation(true))
    logo: Express.Multer.File
  ) {
    return this.companiesService.addOrChangeCompanyLogo(id, user, logo);
  }

  @Delete("company/:id/logo")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLogo(@Param("id", ParseIntPipe) id: number, @User() user: IUser) {
    return this.companiesService.deleteCompanyLogo(id, user);
  }

  @Delete("company/:id")
  deleteCompany(@Param("id", ParseIntPipe) id: number, @User() user: IUser) {
    return this.companiesService.deleteCompany(id, user);
  }

  @Get("company/:id")
  getCompany(@Param("id", ParseIntPipe) id: number, @User() user: IUser) {
    return this.companiesService.getCompany(id, user);
  }

  @Get()
  @Roles(Role.SuperAdmin, Role.Admin)
  @UsePipes(
    new CustomValidationPipe<CompaniesQueryDto>(CompaniesQuerySchema, "query")
  )
  getCompanies(@Query() query: CompaniesQueryDto) {
    return this.companiesService.getCompanies(query);
  }

  @Get("user")
  @UsePipes(
    new CustomValidationPipe<CompaniesQueryDto>(CompaniesQuerySchema, "query")
  )
  getUsersCompanies(@User("id") id: number, @Query() query: CompaniesQueryDto) {
    return this.companiesService.getCompanies(query, id);
  }
}
