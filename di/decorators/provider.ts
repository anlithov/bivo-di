import type {
  Class,
  ProviderClass,
  ProviderDecorator,
} from "../types/types.ts";
import { checkBaseClass } from "./check-common.ts";
import type { ProviderDecoratorContext } from "../types/types.ts";

export const Provider = (): ProviderDecorator => {
  return (
    value: ProviderClass,
    ctx: ClassDecoratorContext,
  ): typeof value => {
    checkBaseClass(ctx, "Provider");

    const newMeta: ProviderDecoratorContext["metadata"] = {
      provider: true,
      provider_name: ctx.name || "UNKNOWN",
    };
    Object.assign(ctx.metadata, newMeta);

    const resultObj = {
      [value.name]: class extends value {
        private __registerDone = false;
        private __shutdownDone = false;

        constructor(...args: any[]) {
          super(...args);
        }

        async __register() {
          const registerFc = this?.onInit as (() => Promise<void>) | undefined;
          if (registerFc) {
            this.__registerDone = true;
            await registerFc();
          }
        }

        async __shutdown() {
          const shutdownFc = this?.shutdown as (() => Promise<void>) | undefined;
          if (shutdownFc) {
            this.__shutdownDone = true;
            try {
              await shutdownFc();
            } catch (err: unknown) {
              console.error(`Shutdown error: ${(err as Error)?.stack}`);
            }
          }
        }
      }
    }

    return resultObj[value.name] as Class;
  };
};
