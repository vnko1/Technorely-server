import { HttpAdapterHost, NestFactory } from "@nestjs/core";

import { CatchEverythingFilter } from "src/common/exceptions";
import { AppModule } from "src/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // * Optional
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));
  // * Optional
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
