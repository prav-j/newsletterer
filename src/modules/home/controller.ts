import { RequestHandler } from "../../utils/requestHandler";

export const home = (handler: RequestHandler) => {
  handler.sendResponse(`Home - ${process.env.NODE_ENV}`)
};

