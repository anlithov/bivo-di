import type { Class, ContainerDecoratorContext } from "../types/types.ts";

const getContainerMeta = (container: Class) => {
  if (!container[Symbol.metadata]?.container) {
    throw new Error(
      `registerContainer error! ${container?.name} is not @Container()!`,
    );
  }
  return container[Symbol.metadata] as ContainerDecoratorContext["metadata"];
};

export const registerContainer = async (container: Class): Promise<void> => {
  const containerMeta = getContainerMeta(container);
  await containerMeta.__container_reg_fn();
};

export const shutdownContainer = async (container: Class): Promise<void> => {
  const containerMeta = getContainerMeta(container);
  await containerMeta.__container_shutdown_fn();
};
