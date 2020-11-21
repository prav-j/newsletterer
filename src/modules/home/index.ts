import { RequestHandler } from "../../utils/requestHandler";

export const index = (handler: RequestHandler) => {
  handler.sendResponse(`Home - ${process.env.NODE_ENV}`)
};

