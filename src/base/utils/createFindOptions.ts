import { Request } from "express";

export function createFindOptions(req: Request, otherOptions: any = {}) {
  const optionsString = req.query.options as string;
  return {
    ...(optionsString && JSON.parse(optionsString)),
    ...otherOptions,
  };
}
