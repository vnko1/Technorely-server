import { Request, Response } from "express";
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";

import { AppService } from "src/common/services";

@Catch(HttpException)
export class HttpExceptionFilter extends AppService implements ExceptionFilter {
  constructor() {
    super();
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    };

    responseBody["message"] = exception.message;
    responseBody["error"] = exception.getResponse();
    if (
      exception.cause &&
      typeof exception.cause === "object" &&
      "issues" in exception.cause
    ) {
      responseBody["cause"] = exception.cause["issues"];
    }

    response.status(status).json(responseBody);
  }
}
