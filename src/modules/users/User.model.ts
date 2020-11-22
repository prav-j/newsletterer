import {
  BeforeCreate,
  BelongsToMany,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique
} from "sequelize-typescript";
import { v4 } from 'uuid'
import { UUID } from "../../types/UUID";
import Subreddit from "../subreddit/Subreddit.model";
import UserSubreddit from "./UserSubreddit.model";

@Table({
  tableName: "users",
  updatedAt: false
})
export default class User extends Model<User> {
  @PrimaryKey
  @Column({type: DataType.UUID})
  id: UUID;

  @Unique({name: 'user.name', msg: 'User name has to be unique'})
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name: String;

  @Unique({name: 'user.email', msg: 'User email has to be unique'})
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  email: String;

  @Default(true)
  @Column
  isNewsletterEnabled: boolean

  @Default("08:00:00")
  @Column({type: DataType.TIME})
  newsletterSendTime: string

  @Default("UTC")
  @Column
  timezone: string

  @BeforeCreate({name: 'generateUUID'})
  static generateUUID(user: User) {
    user.id = v4()
  }

  @BelongsToMany(() => Subreddit, () => UserSubreddit)
  subreddits: Subreddit[]

  format(keys?: (keyof User)[]) {
    const defaultKeys: (keyof User)[] = [
      'id',
      'name',
      'email',
      'isNewsletterEnabled',
      'newsletterSendTime',
      'timezone',
    ]
    const outputKeys = keys || defaultKeys
    return outputKeys.reduce((acc, curr: keyof User) => {
      acc[curr] = this[curr]
      return acc
    }, {} as Record<keyof User, unknown>)
  }
}