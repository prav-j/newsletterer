import { RequestHandler } from "../../utils/requestHandler";
import * as service from './service'
import { ValidationError } from 'sequelize'

export const createUser = async (handler: RequestHandler) => {
  const body = handler.getBody()
  try {
    const user = await service.createUser(body || {})
    handler.sendCreatedResponse(user)
  } catch (error) {
    if (error instanceof ValidationError) {
      handler.sendValidationError(error.errors[0])
    } else {
      handler.sendServerError(error)
    }
  }
};

export const getUsers = async (handler: RequestHandler) => {
  handler.sendResponse(await service.getUsers())
};

export const fetchUser = async (handler: RequestHandler) => {
  const userId = handler.getRouteParameters().userId
  const user = await service.fetchUser(userId);
  if (user) {
    handler.sendResponse(user.format())
  } else {
    handler.sendNotFoundResponse()
  }
}

export const updateUser = async (handler: RequestHandler) => {
  const userId = handler.getRouteParameters().userId
  try {
    const user = await service.updateUser(userId, handler.getBody());
    if (!user) {
      handler.sendNotFoundResponse()
      return
    }
    handler.sendResponse(user.format())
  } catch (error) {
    if (error instanceof ValidationError) {
      handler.sendValidationError(error.errors[0])
    } else {
      handler.sendServerError(error)
    }
  }
}