import { RequestHandler } from "../../utils/requestHandler";
import * as service from './service'
import { ValidationError } from 'sequelize'

export const fetchSubreddit = async (handler: RequestHandler) => {
  const {name: subredditName} = handler.getRouteParameters()
  const subreddit = await service.fetchSubreddit(subredditName)
  if (subreddit) {
    handler.sendResponse(await subreddit.formatWithUserCount())
  } else {
    handler.sendNotFoundResponse()
  }
};

export const createSubreddit = async (handler: RequestHandler) => {
  const {name: subredditName} = handler.getRouteParameters()
  const subreddit = await (await service.createOrFetchSubreddit(subredditName)).formatWithUserCount()
  if (subreddit.userCount === 0) {
    handler.sendCreatedResponse(subreddit)
  } else {
    handler.sendResponse(subreddit)
  }
};

export const subscribeToSubreddit = async (handler: RequestHandler) => {
  const {name: subredditName} = handler.getRouteParameters()
  try {
    const userId = handler.getBody().user
    const subreddit = await service.createOrFetchSubreddit(subredditName)
    await service.subscribeUserToSubreddit(userId, subreddit)
    handler.sendResponse(null)
  } catch (error) {
    if (error instanceof ValidationError) {
      handler.sendValidationError(error.errors[0] || error.message)
    } else {
      handler.sendServerError(error)
    }
  }
};