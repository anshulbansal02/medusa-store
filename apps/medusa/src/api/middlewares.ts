import {
  defineMiddlewares,
  errorHandler,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";

import { captureBetterStackException } from "../observability/better-stack-errors";

const defaultErrorHandler = errorHandler();

function getRequestPath(req: MedusaRequest) {
  const request = req as MedusaRequest & {
    originalUrl?: string;
    path?: string;
    url?: string;
  };

  return request.originalUrl ?? request.path ?? request.url;
}

export default defineMiddlewares({
  errorHandler: (
    error: unknown,
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction,
  ) => {
    captureBetterStackException(error, {
      method: req.method,
      path: getRequestPath(req),
    });

    return defaultErrorHandler(error, req, res, next);
  },
});
