import { Express } from "express";
import homeRoutes from './home/routes'
import userRoutes from './users/routes'
import subredditRoutes from './subreddit/routes'

export default function (app: Express) {
  homeRoutes(app)
  userRoutes(app)
  subredditRoutes(app)
  return app
}
