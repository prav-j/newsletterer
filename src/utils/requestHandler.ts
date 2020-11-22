import { Request, Response } from "express";

const formatData = (data?: unknown) => {
  return data ? {data} : undefined
}

const formatError = (error?: unknown) => {
  return error ? {error} : undefined
}

const handler = (request: Request, response: Response) => {
  return {
    getBody: () => {
      return request.body;
    },

    getRouteParameters: () => {
      return request.params;
    },

    getRequest: () => {
      return request;
    },

    sendResponse: (data?: unknown) => {
      return response.status(200).send(formatData(data));
    },

    sendNotFoundResponse: (data?: unknown) => {
      return response.status(404).send(formatData(data));
    },

    sendCreatedResponse: (data?: unknown) => {
      return response.status(201).send(formatData(data));
    },

    sendValidationError: (error?: unknown) => {
      return response.status(400).send(formatError(error));
    },

    sendServerError(error?: Error) {
      console.log(error)
      return response.status(500).send({error: `Internal Server Error`, message: error?.message || error});
    }
  }
}

export type RequestHandler = ReturnType<typeof handler>

export function handle(method: (handler: RequestHandler, next?: () => void) => void) {
  return (request: Request, response: Response, next: () => void) => {
    method(handler(request, response), next);
  };
}