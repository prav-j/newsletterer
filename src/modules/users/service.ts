import User from "./User.model";
import { getSequelizeInstance } from "../../models/base";

interface CreateUserRequest {
  name: string
  email: string
}

export const createUser = async ({name, email}: CreateUserRequest) => {
  const sequelize = getSequelizeInstance()
  return sequelize.transaction(async transaction => {
    return User.build({name, email})
      .save({transaction});
  })
}