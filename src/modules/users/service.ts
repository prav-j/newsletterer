import User from "./User.model";
import { withTransaction } from "../../db";
import { UUID } from "../../types/UUID";
import { Transaction } from "sequelize";

interface CreateOrUpdateUserRequest {
  name: string
  email: string
  isNewsletterEnabled: boolean | undefined,
  newsletterSendTime: string | undefined,
  timezone: string | undefined
}

export async function getUsers() {
  return (await User.findAll()).map(({id, name, email}) => ({id, name, email}));
}

export async function fetchUser(userId: UUID, transaction?: Transaction) {
  return User.findOne({where: {id: userId}, transaction});
}

const extractFromRequest = (request: CreateOrUpdateUserRequest): Partial<User> => {
  return {
    name: request.name,
    email: request.email,
    isNewsletterEnabled: request.isNewsletterEnabled,
    newsletterSendTime: request.newsletterSendTime,
    timezone: request.timezone,
  }
}

export const createUser = async (request: CreateOrUpdateUserRequest) => {
  return User.create(extractFromRequest(request))
}

export async function updateUser(userId: string, request: CreateOrUpdateUserRequest) {
  return withTransaction(async transaction => {
    const user = await fetchUser(userId, transaction)
    if (!user) {
      return null
    }
    return user.update(extractFromRequest(request), {transaction});
  })
}