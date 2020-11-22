import User from "./User.model";
import { withTransaction } from "../../db";
import { UUID } from "../../types/UUID";
import { Transaction } from "sequelize";

interface CreateOrUpdateUserRequest {
  name: string
  email: string
}

export async function getUsers() {
  return (await User.findAll()).map(({id, name, email}) => ({id, name, email}));
}

export async function fetchUser(userId: UUID, transaction?: Transaction) {
  return User.findOne({where: {id: userId}, transaction});
}

export const createUser = async ({name, email}: CreateOrUpdateUserRequest) => {
  return User.create({name, email})
}

export async function updateUser(userId: string, {name, email}: CreateOrUpdateUserRequest) {
  return withTransaction(async transaction => {
    const user = await fetchUser(userId, transaction)
    if (!user) {
      return null
    }
    return user.update({name, email}, {transaction});
  })
}