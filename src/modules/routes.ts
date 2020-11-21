import { Express } from "express";
import homeRoutes from './home/routes'
import userRoutes from './users/routes'

export default function (app: Express) {
  homeRoutes(app)
  userRoutes(app)
}
