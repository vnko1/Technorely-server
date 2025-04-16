import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { RequestMethod } from "@nestjs/common";
import * as cookieParser from "cookie-parser";

import { CatchEverythingFilter } from "src/common/exceptions";
import { AppModule } from "src/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Frame-Options",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
  app.setGlobalPrefix("api", {
    exclude: [{ path: "/", method: RequestMethod.GET }],
  });
  app.use(cookieParser());
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
