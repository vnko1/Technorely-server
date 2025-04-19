import { Role } from "src/types/enums";

export interface IUser {
  id: number;
  role: Role;
  email: string;
}
