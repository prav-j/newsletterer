import { getUsersWithPendingNewsletter } from "../users/service";
import { emailNewsletterForUser } from "./service";

const INTERVAL = 30000
export default () => {
  console.log('Starting newsletter scheduler.')
  return setInterval(async () => {
    const users = await getUsersWithPendingNewsletter()
    console.log('Checking for users with pending newsletter. Found ', users.length)
    if (users.length > 0) {
      await Promise.all(users.map(user => user.id).map(id => emailNewsletterForUser(id)))
    }
  }, INTERVAL)
}