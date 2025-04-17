import { HttpAdapterHost } from "@nestjs/core";
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

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
