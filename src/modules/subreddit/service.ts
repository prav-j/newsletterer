import { withTransaction } from "../../db";
import Subreddit from "./Subreddit.model";
import { UUID } from "../../types/UUID";
import * as userService from '../users/service'
import { Transaction, ValidationError } from "sequelize";

export const fetchSubreddit = async (name: string, transaction?: Transaction) => {
  const subreddit = await Subreddit.findOne({where: {name}, transaction})
  if (subreddit) {
    return subreddit
  }
  return null
};

export const subscribeUserToSubreddit = async (userId: UUID, subreddit: Subreddit) => {
  const user = await userService.fetchUser(userId)
  if (!user) {
    throw new ValidationError('User does not exist!')
  }
  await subreddit.$add('user', user)
};

export const createOrFetchSubreddit = async (name: string) => {
  return withTransaction(async transaction => {
    const subreddit = await fetchSubreddit(name, transaction)
    if (subreddit) {
      return subreddit
    }
    return Subreddit.create({name}, {transaction});
  })
}