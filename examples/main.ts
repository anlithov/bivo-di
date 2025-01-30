import { Container } from "../di/decorators/container.ts";
import { UserContainer } from "./services/user.module.ts";
import { resolveProvider } from "../di/helpers/provider.resolver.ts";
import { MainService } from "./main.service.ts";
import { registerContainer } from "../di/helpers/container.resolver.ts";

@Container({
  providers: [MainService],
  containers: [UserContainer],
})
export class AppContainer {}

await registerContainer(AppContainer).catch((e) => console.log(e));

await resolveProvider(AppContainer, MainService).testHello();
