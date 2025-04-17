import { HttpStatus, ParseFilePipeBuilder } from "@nestjs/common";

import { UploadFileTypeValidator } from "src/common/validators";
import {
  MAX_PROFILE_PICTURE_SIZE_IN_BYTES,
  VALID_UPLOADS_MIME_TYPES,
} from "src/utils/constants";

export const uploadValidation = (fileIsRequired = false) =>
  new ParseFilePipeBuilder()
    .addValidator(
      new UploadFileTypeValidator({ fileType: VALID_UPLOADS_MIME_TYPES })
    )
    .addMaxSizeValidator({
      maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES,
    })
    .build({
      fileIsRequired,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
