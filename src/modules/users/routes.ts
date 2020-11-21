import { Express } from "express";
import { handle } from "../../utils/requestHandler";
import { createUser, getUsers } from "./controller";

export default (app: Express) => {
  app.get('/users', handle(getUsers))
  app.post('/users', handle(createUser))
  return app
}