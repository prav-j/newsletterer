import User from "../users/User.model";
import { getTopPostsInLastDay } from "../posts/service";
import { UUID } from "../../types/UUID";

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

export const emailNewsletterForUser = async (userId: UUID) => {
  const user = await User.findOne({where: {id: userId}})
  if (!user || !user.isNewsletterEnabled) {
    return
  }
  const newsletter = await createNewsletterForUser(user)

  console.log('Dispatching newsletter for', newsletter.user, 'to', newsletter.email)
  console.log(JSON.stringify(newsletter, null, 2))

  return newsletter
}