import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import {
  ConfigAndUrlOptions,
  TransformationOptions,
  UploadApiOptions,
  UploadApiResponse,
  v2 as clouds,
} from "cloudinary";

export type DeleteOptions = {
  sliceValue?: number;
  resource_type?: string;
  type?: string;
  notification_url: string;
  invalidate?: boolean;
};

@Injectable()
export class CloudinaryService {
  protected getPublicIdFromUrl(url: string, sliceValue: number = -3) {
    return url
      .split("/")
      .slice(sliceValue)
      .join("/")
      .split(".")[0]
      .split("?")[0];
  }

  private isValidUrl(string: string) {
    try {
      new URL(string);
      return true;
    } catch {
      console.log(1);
      return false;
    }
  }

  upload(
    filePath: string,
    options?: Partial<UploadApiOptions>
  ): Promise<UploadApiResponse> {
    try {
      return clouds.uploader.upload(filePath, options);
    } catch (error) {
      if (error instanceof Error) {
        throw new ServiceUnavailableException(error.message);
      }
      throw new ServiceUnavailableException(error);
    }
  }

  async delete(
    filePath: string,
    options?: Partial<DeleteOptions>
  ): Promise<unknown> {
    try {
      const publicId = this.isValidUrl(filePath)
        ? this.getPublicIdFromUrl(filePath, options?.sliceValue)
        : filePath;

      return clouds.uploader.destroy(publicId, options);
    } catch (error) {
      if (error instanceof Error) {
        throw new ServiceUnavailableException(error.message);
      }
      throw new ServiceUnavailableException(error);
    }
  }

  edit(
    url: string,
    options?: TransformationOptions | ConfigAndUrlOptions,
    sliceValue = -4
  ) {
    const publicId = this.getPublicIdFromUrl(url, sliceValue);
    return clouds.url(publicId, options);
  }
}
