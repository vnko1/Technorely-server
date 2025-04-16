import { Logger } from "@nestjs/common";

export const logger = (name: string) => new Logger(name);
