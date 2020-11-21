import { RequestHandler } from "../../utils/requestHandler";

export const createUser = (handler: RequestHandler) => {
  handler.sendResponse({message: `Creating User`, body: handler.getBody()})
};

