import User from "../users/User.model";
import { getTopPostsInLastDay } from "../posts/service";
import { UUID } from "../../types/UUID";
import Subreddit from "../subreddit/Subreddit.model";
import * as emailAPI from "../../api/emailService"
import NewsletterSchedule from "./NewsletterSchedule.model";
import { Transaction } from "sequelize";
import { DateTime } from "luxon";

const createNewsletterForUser = async (user: User) => {
  if (user.subreddits.length === 0) {
    return null
  }
  const states = await Promise.all(user.subreddits.map(subreddit => getTopPostsInLastDay(subreddit)))
  return {
    user: user.name,
    email: user.email,
    subreddits: states
      .filter(state => state.posts.length > 0)
      .map(state => {
        return {
          url: state.link,
          posts: state.posts
        }
      })
  }
}

export const emailNewsletterForUser = async (userId: UUID): Promise<Newsletter | undefined> => {
  const user = await User.findOne({where: {id: userId}, include: [NewsletterSchedule, Subreddit]})
  if (!user || !user.newsletterSchedule.isEnabled) {
    return
  }
  await scheduleNextNewsletter(user.newsletterSchedule)
  const newsletter = await createNewsletterForUser(user)
  if (!newsletter) {
    return
  }
  await emailAPI.emailNewsletter(newsletter)
  return newsletter
}

export interface Newsletter {
  user: User['name']
  email: User['email']
  subreddits: {
    url: Subreddit['url'],
    posts: {
      thumbnail?: string,
      title: string
      link: string
    }[]
  }[]
}

export const cancelSchedule = async (user: User, transaction?: Transaction) => {
  await NewsletterSchedule.update({
    isEnabled: false,
    nextScheduledAt: null
  }, {
    where: {userId: user.id},
    transaction
  })
}

export const scheduleNextNewsletter = async (schedule: NewsletterSchedule, transaction?: Transaction) => {
  await schedule.update({
    nextScheduledAt: schedule.isEnabled ? computeNextNewsletterTime(schedule.newsletterSendTime, schedule.timezone) : null
  }, {
    transaction
  })
}

export interface NewsletterScheduleRequest {
  isEnabled: boolean | undefined,
  newsletterSendTime: string | undefined,
  timezone: string | undefined
}

export const updateNewsletterSchedule = async (
  request: NewsletterScheduleRequest,
  schedule: NewsletterSchedule,
  transaction?: Transaction
) => {
  const {
    isEnabled = schedule.isEnabled,
    newsletterSendTime = schedule.newsletterSendTime,
    timezone = schedule.timezone,
  } = request || {}
  return NewsletterSchedule.update({
    isEnabled,
    newsletterSendTime,
    timezone,
    nextScheduledAt:
      isEnabled ? computeNextNewsletterTime(
        newsletterSendTime,
        timezone
      ) : null
  }, {
    where: {userId: schedule.userId},
    transaction
  })
}

export const computeNextNewsletterTime = (newsletterSendTime: string, timezone: string) => {
  const nextTimestampISO = `${DateTime.local().setZone(timezone).toFormat("yyyy-MM-dd")}T${newsletterSendTime}`
  const nextTime = DateTime.fromISO(nextTimestampISO, {zone: timezone})
  if (nextTime.diffNow().milliseconds < 0) {
    return nextTime.plus({hours: 24}).toSeconds()
  }
  return nextTime.toSeconds()
}
