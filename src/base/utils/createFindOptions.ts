import { Request } from "express";

export function createFindOptions<T>(req: Request, otherOptions?): T {
  const optionsString = req.query.options as string;
  return {
    ...(optionsString && JSON.parse(optionsString)),
    ...otherOptions,
  };
}
