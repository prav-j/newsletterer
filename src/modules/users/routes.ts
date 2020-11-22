import { Express } from "express";
import { handle } from "../../utils/requestHandler";
import { createUser, fetchUser, getUsers, updateUser } from "./controller";

export default (app: Express) => {
  app.get('/users', handle(getUsers))
  app.post('/users', handle(createUser))
  app.get('/users/:userId', handle(fetchUser))
  app.put('/users/:userId', handle(updateUser))
  return app
}