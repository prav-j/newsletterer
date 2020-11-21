import * as home from "./home";
import { Express } from "express";
import { handle } from "../utils/requestHandler";

export default function (app: Express) {
  app.get("/", handle(home.index));
}
