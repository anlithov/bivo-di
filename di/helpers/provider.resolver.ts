import type { Class } from "../types/types.ts";

export const resolveProvider = <T extends Class>(
  container: Class,
  provider: T,
): InstanceType<T> => {
  return (container as any)?.resolveProvider(provider) as InstanceType<T>;
};
