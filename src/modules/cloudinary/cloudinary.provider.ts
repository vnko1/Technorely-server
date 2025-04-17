import { ConfigService } from "@nestjs/config";
import { v2 as clouds } from "cloudinary";

export const CloudinaryProvider = {
  provide: "Cloudinary",
  inject: [ConfigService],
  useFactory: (configService: ConfigService) =>
    clouds.config({
      cloud_name: configService.get("cloudinary.api_name"),
      api_key: configService.get("cloudinary.api_key"),
      api_secret: configService.get("cloudinary.api_secret"),
      secure: true,
    }),
};
