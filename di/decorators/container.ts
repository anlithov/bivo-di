import {
  Class,
  ContainerDecorator,
  ContainerDecoratorContext,
  ContainerParams,
  ProviderClass,
} from "../types/types.ts";
import { checkBaseClass } from "./check-common.ts";

const logger = console;

export const Container = (params: ContainerParams): ContainerDecorator => {
  const instances: Map<string, object> = new Map();
  const providers: Map<string, Class> = new Map();

  return (
    value: Class,
    ctx: ClassDecoratorContext,
  ): Class => {
    checkBaseClass(ctx, "Container");

    /**
     *  Collecting instances/providers from injected containers
     */
    params.containers?.forEach((container: Class) => {
      if (!container[Symbol.metadata]?.container) {
        throw new Error(
          `Class ${container.name} is not @Container !  (${ctx.name})`,
        );
      }

      const containerMeta = container[Symbol.metadata]
        ?.container_meta as ContainerDecoratorContext["metadata"][
          "container_meta"
        ];

      containerMeta?.instances?.forEach(
        (val, key) => !instances.has(key) && instances.set(key, val),
      );
      containerMeta?.providers?.forEach(
        (val, key) => !providers.has(key) && providers.set(key, val),
      );
    });

    params.providers?.forEach((provider: ProviderClass) => {
      if (!provider[Symbol.metadata]?.injectable) {
        throw new Error(
          `Dependency ${provider.name} should be @Injectable  (${ctx.name})`,
        );
      }

      const injectableName: string = provider[Symbol.metadata]
        ?.injectable_name as string;

      if (!providers.has(injectableName)) {
        providers.set(injectableName, provider);
        return;
      }

      throw new Error(
        `Provider ${injectableName} already exist in container ${ctx.name}`,
      );
    });

    const instantiateProvider = (
      name: string,
      handler: ProxyHandler<object>,
      provider?: Class,
    ): object | undefined => {
      let proxyInstance: object | undefined = undefined;

      if (!provider && providers.has(name)) {
        provider = providers.get(name);
      }

      if (!instances.has(name) && provider) {
        proxyInstance = new provider(
          new Proxy({}, handler),
        ) as object;

        instances.set(name, proxyInstance);

        logger.info(`Provider injected: [${name}] --> (${ctx.name})`);

        return proxyInstance;
      }

      return instances.get(name)!;
    };

    providers.forEach((provider, injectableName) => {
      // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get
      const proxyHandler: ProxyHandler<object> = {
        get(_, prop) {
          prop = String(prop);

          // Cyclic dependencies occurs here
          if (injectableName === prop) {
            return undefined;
          }

          return instantiateProvider(prop, proxyHandler);
        },
      };

      instantiateProvider(injectableName, proxyHandler, provider);
    });

    ctx.metadata.container = true;
    ctx.metadata.container_meta = { instances, providers };

    ctx.metadata.__container_reg_fn = async () => {
      for (const [instanceName, instance] of instances) {
        const regMethod = (instance as { __register: () => Promise<void> })
          ?.__register;

        if (regMethod && typeof regMethod === "function") {
          logger.info(`Init provider: ${instanceName}`);
          await regMethod.apply(instance);
        }
      }
    };

    ctx.metadata.__container_shutdown_fn = async () => {
      for (const [_, instance] of instances) {
        const shutdownMethod = (instance as { __shutdown: () => Promise<void> })
          ?.__shutdown;

        if (shutdownMethod && typeof shutdownMethod === "function") {
          await shutdownMethod.apply(instance);
        }
      }
    };

    const resultObj = {
      [value.name]: class extends value {
        constructor(...args: any[]) {
          super(...args);
        }

        static resolveProvider<T extends Class>(
          provider: Class,
        ): T | undefined {
          const isInjectable = provider[Symbol.metadata]?.injectable as boolean;
          const injectableName: string = provider[Symbol.metadata]
            ?.injectable_name as string;

          if (injectableName && isInjectable) {
            return instances.get(injectableName) as T;
          }
        }
      },
    };

    return resultObj[value.name] as Class;
  };
};
