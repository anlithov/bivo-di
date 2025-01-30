import { Provider } from "../di/decorators/provider.ts";
import { UserService } from "./services/user.service.ts";

@Provider()
export class MainService {
  constructor(
    private services: {
      UserService: UserService;
    },
  ) {}

  async testHello() {
    return this.services.UserService.hello();
  }
}
