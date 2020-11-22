import User from "../users/User.model";
import { getTopPostsInLastDay } from "../posts/service";
import { UUID } from "../../types/UUID";
import Subreddit from "../subreddit/Subreddit.model";
import * as emailAPI from "../../api/emailService"
import NewsletterSchedule from "./NewsletterSchedule.model";

const createNewsletterForUser = async (user: User) => {
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
  const newsletter = await createNewsletterForUser(user)
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