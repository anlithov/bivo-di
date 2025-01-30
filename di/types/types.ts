export interface InitializableProvider {
  onInit: () => Promise<void>;
}

export interface ShutdownableProvider {
  shutdown: () => Promise<void>;
}

export type Class<T = any> = new (...args: any[]) => T;

export type ProviderClass<T = any> = Class<
  | T
  | (T & InitializableProvider)
  | (T & ShutdownableProvider)
  | (T & InitializableProvider & ShutdownableProvider)
>;

export type ProviderDecorator = (
  value: Class,
  ctx: ClassDecoratorContext,
) => ProviderClass;

export type ContainerDecorator = (
  value: Class,
  ctx: ClassDecoratorContext,
) => Class;

export interface ContainerParams {
  providers?: Array<Class>;
  containers?: Array<Class>;
}

export type ContainerDecoratorContext = ClassDecoratorContext & {
  metadata: {
    container: boolean;
    container_name: string;
    container_meta: {
      instances: Map<string, object>;
      providers: Map<string, Class>;
    };
    __container_reg_fn: () => Promise<void>;
    __container_shutdown_fn: () => Promise<void>;
  };
};

export type ProviderDecoratorContext = ClassDecoratorContext & {
  metadata: {
    provider: boolean;
    provider_name: string;
  };
};