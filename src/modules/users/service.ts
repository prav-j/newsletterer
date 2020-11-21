import User from "./User.model";
import { withTransaction } from "../../db";

export async function getUsers() {
  return (await User.findAll()).map(({id, name, email}) => ({id, name, email}));
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