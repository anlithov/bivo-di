import { Provider } from "../../di/decorators/provider.ts";

@Provider()
export class UserService {
  async hello() {
    console.log("YYYEEESSS");
    return "jkllk";
  }
}
