import * as express from "express";
import { Request, Response, NextFunction } from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as errorHandler from "errorhandler";
import { EventEmitter } from "events";
import routes from "./modules/routes";
import * as cors from "cors";
import { config } from 'dotenv'
import { initialize } from "./models/base";

const app = express();
config()
app.set("port", process.env.PORT || 3000);
app.set("emitter", new EventEmitter());
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
  next();
});
app.use(cors());
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(errorHandler());

app.get("emitter").on("appStarted", function () {
  console.log(("App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
  console.log("Press CTRL-C to stop\n");
});

initializeApplication()
  .catch(error => {
    console.log("Error occurred when initializing app.");
    console.log(error);
    process.exit(1);
  });

module.exports = app;

async function initializeApplication() {
  routes(app);
  await initialize()
  app.listen(app.get("port"), () => {
    app.get("emitter").emit("appStarted");
  });
  return;
}