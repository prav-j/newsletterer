import { Newsletter } from "../modules/newsletter/service";

export const emailNewsletter = (newsletter: Newsletter) => {
  console.log('Dispatching newsletter for', newsletter.user, 'to', newsletter.email)
  console.log(JSON.stringify(newsletter, null, 2))
}