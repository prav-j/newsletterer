import User from "./User.model";
import { withTransaction } from "../../db";
import { UUID } from "../../types/UUID";
import { Transaction } from "sequelize";

export async function getUsers() {
  return (await User.findAll()).map(({id, name, email}) => ({id, name, email}));
}

export async function fetchUser(userId: UUID, transaction?: Transaction) {
  return User.findOne({where: {id: userId}, transaction});
}

interface CreateUserRequest {
  name: string
  email: string
}

export const createUser = async ({name, email}: CreateUserRequest) => {
  return withTransaction(async transaction => {
    return User.build({name, email})
      .save({transaction});
  })
}