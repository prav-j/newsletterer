import * as home from "./home";
import { Express } from "express";

export default function (app: Express) {
  app.get("/", home.index);
}
