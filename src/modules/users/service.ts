import User from "./User.model";
import { withTransaction } from "../../db";
import { UUID } from "../../types/UUID";
import { Op, Transaction } from "sequelize";
import NewsletterSchedule from "../newsletter/NewsletterSchedule.model";
import { DateTime } from "luxon";
import { cancelSchedule, NewsletterScheduleRequest, updateNewsletterSchedule } from "../newsletter/service";

interface CreateOrUpdateUserRequest {
  name: string
  email: string
  schedule: NewsletterScheduleRequest
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
      await cancelSchedule(user)
    }
    user.$set('newsletterSchedule', newsletterSchedule)
    return user
  })
}

export const updateUser = async (userId: string, request: CreateOrUpdateUserRequest) => {
  return withTransaction(async transaction => {
    const user = await User.findOne({where: {id: userId}, include: [NewsletterSchedule], transaction})
    if (!user) {
      return null
    }
    await user.update(extractUserData(request), {transaction});
    await updateNewsletterSchedule(request.schedule, user.newsletterSchedule, transaction)
    return user
  });
};

export const getUsersWithPendingNewsletter = async (): Promise<User[]> => {
  const timeNow = DateTime.local().toSeconds()
  return User.findAll({
    include: [{
      model: NewsletterSchedule,
      where: {
        isEnabled: {
          [Op.eq]: true
        },
        nextScheduledAt: {
          [Op.lte]: timeNow
        }
      }
    }],
  })
}