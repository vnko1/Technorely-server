import { DiskStorageOptions } from "multer";
import { join } from "path";

export const refreshToken = "refresh_token";
export const accessToken = "access_token";

export const errorMessages = {
  email: { required: "Email is required", exist: "Email already exists" },
  password: {
    token: "Password reset token is required",
    required: "Password is required",
    requirement:
      "Password must be at least 8 characters and no more 30 characters, including uppercase letters, one number and Latin letters only. Space symbol is not included.",
  },
  role: { required: "Role is required" },
  username: { required: "Username is required" },
  company: {
    name: { required: "Name is required" },
    service: { required: "Service is required" },
    capital: { required: "Capital is required" },
    price: { required: "Price is required" },
    logo: { required: "Logo is required" },
    update: "At least one field must be provided",
  },
};

export const passwordRegex =
  /^(?!.*[А-Яа-яЁёЇїЄєҐґІі])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-.\\/:;<=>?@[\\\]^_`{|}~])^[^\s"'=;-]*$/;

export const emailRegex =
  /^(?!.*\s)(?=.{6,320}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const userNameRegex =
  /^(?!.*[!@#\\$%^&*_+\-=~?]{2,})[A-Za-z0-9А-Яа-яҐЄІЇґєії!@#\\$%^&*_+\-=~?]{4,20}$/i;

export const storageConfig: DiskStorageOptions = {
  destination: (_, __, cb) => {
    cb(null, join("src", "temp"));
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.mimetype.split("/")[1];

    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  },
};

export const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024;
export const VALID_UPLOADS_MIME_TYPES = ["image/jpeg", "image/png"];
