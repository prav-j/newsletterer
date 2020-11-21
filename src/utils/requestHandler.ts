import { Request, Response } from "express";

const handler = (request: Request, response: Response) => {
  return {
    getBody: () => {
      return request.body;
    },

    getRequest: () => {
      return request;
    },

    sendResponse: (data?: unknown) => {
      return response.status(200).send({data});
    },

    sendNotFoundResponse: (data?: unknown) => {
      return response.status(404).send({data});
    },

    sendCreatedResponse: (data?: unknown) => {
      return response.status(201).send({data});
    },

    sendValidationError: (error?: unknown) => {
      return response.status(400).send({error});
    },

    sendServerError(error?: Error) {
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