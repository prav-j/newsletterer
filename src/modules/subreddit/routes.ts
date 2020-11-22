import { Express } from "express";
import { handle } from "../../utils/requestHandler";
import { createSubreddit, fetchSubreddit, subscribeToSubreddit, unsubscribeFromSubreddit } from "./controller";

export default (app: Express) => {
  app.get('/subreddits/:name', handle(fetchSubreddit))
  app.post('/subreddits/:name', handle(createSubreddit))
  app.post('/subreddits/:name/subscribe', handle(subscribeToSubreddit))
  app.post('/subreddits/:name/unsubscribe', handle(unsubscribeFromSubreddit))
}