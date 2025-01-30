export const checkBaseClass = <T extends ClassDecoratorContext>(
  ctx: T,
  decoratorName: string,
) => {
  if (ctx.kind !== "class") {
    throw new Error(
      `@${decoratorName}() decorator only allowed on classes! (${ctx.name})`,
    );
  }

  if (!ctx.metadata) {
    throw new Error(`This runtime not support decorator metadata!`);
  }
};
