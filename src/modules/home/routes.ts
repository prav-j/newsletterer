import { Express } from "express";
import { handle } from "../../utils/requestHandler";
import { home } from "./controller";

export default function (app: Express) {
  app.get("/", handle(home));
  return app
}
