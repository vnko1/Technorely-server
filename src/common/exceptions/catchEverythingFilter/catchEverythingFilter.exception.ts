import { HttpAdapterHost } from "@nestjs/core";
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

import { AppService } from "src/common/services";

@Catch()
export class CatchEverythingFilter
  extends AppService
  implements ExceptionFilter
{
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
    };

    if (exception instanceof HttpException) {
      responseBody["message"] = exception.message;
      responseBody["error"] = exception.getResponse();

      if (
        exception.cause &&
        typeof exception.cause === "object" &&
        "issues" in exception.cause
      ) {
        responseBody["cause"] = exception.cause["issues"];
      }
    } else if (
      exception &&
      typeof exception === "object" &&
      "message" in exception
    ) {
      responseBody["message"] = exception.message;
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
