import { Container } from "../../di/decorators/container.ts";
import { UserService } from "./user.service.ts";
import { resolveProvider } from "../../di/helpers/provider.resolver.ts";

@Container({
  providers: [UserService],
})
export class UserContainer {}
