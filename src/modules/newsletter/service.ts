import User from "../users/User.model";
import { getTopPostsInLastDay } from "../posts/service";
import { UUID } from "../../types/UUID";
import Subreddit from "../subreddit/Subreddit.model";
import * as emailAPI from "../../api/emailService"

const createNewsletterForUser = async (user: User) => {
  const subreddits = await user.$get('subreddits')
  const states = await Promise.all(subreddits.map(subreddit => getTopPostsInLastDay(subreddit)))
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
  const user = await User.findOne({where: {id: userId}})
  if (!user || !user.isNewsletterEnabled) {
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