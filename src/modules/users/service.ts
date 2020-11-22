import User from "./User.model";
import { withTransaction } from "../../db";
import { UUID } from "../../types/UUID";
import { Transaction } from "sequelize";
import NewsletterSchedule from "../newsletter/ScheduledNewsletter.model";

interface CreateOrUpdateUserRequest {
  name: string
  email: string
  schedule: {
    isEnabled: boolean | undefined,
    newsletterSendTime: string | undefined,
    timezone: string | undefined
  }
}

export async function getUsers() {
  return (await User.findAll()).map(({id, name, email}) => ({id, name, email}));
}

export async function fetchUser(userId: UUID, transaction?: Transaction) {
  return User.findOne({where: {id: userId}, transaction});
}

const extractUserData = (request: CreateOrUpdateUserRequest): Partial<User> => {
  return {
    name: request.name,
    email: request.email,
  }
}

const extractScheduleData = (request: CreateOrUpdateUserRequest): Partial<NewsletterSchedule> => {
  return {
    isEnabled: request.schedule?.isEnabled,
    newsletterSendTime: request.schedule?.newsletterSendTime,
    timezone: request.schedule?.timezone,
  }
}

export const createUser = async (request: CreateOrUpdateUserRequest) => {
  return await withTransaction(async transaction => {
    const user = await User.create(extractUserData(request), {transaction})
    const newsletterSchedule = await NewsletterSchedule.create({
      userId: user.id,
      ...extractScheduleData(request)
    }, {transaction})
    if (request.schedule?.isEnabled === false) {
      await newsletterSchedule.cancelScheduled(transaction)
    }
    user.$set('newsletterSchedule', newsletterSchedule)
    return user
  })
}

export async function updateUser(userId: string, request: CreateOrUpdateUserRequest) {
  return withTransaction(async transaction => {
    const user = await fetchUser(userId, transaction)
    if (!user) {
      return null
    }
    await user.update(extractUserData(request), {transaction});
    await (await user.$get('newsletterSchedule'))?.update(extractScheduleData(request), {transaction})
    return user
  })
}