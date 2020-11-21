import { Express } from "express";
import { handle } from "../../utils/requestHandler";
import { createUser } from "./controller";

export default (app: Express) => {
  app.post('/users', handle(createUser))
  return app
}