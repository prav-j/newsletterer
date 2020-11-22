import { Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import User from "./User.model";
import Subreddit from "../subreddit/Subreddit.model";
import { v4 } from "uuid";

@Table({
  tableName: "user_subreddit",
  updatedAt: false,
  createdAt: false
})
export default class UserSubreddit extends Model<UserSubreddit> {
  @ForeignKey(() => User)
  @PrimaryKey
  @Column({type: DataType.UUID})
  userId: ReturnType<typeof v4>;

  @ForeignKey(() => Subreddit)
  @PrimaryKey
  @Column
  subreddit: string;
}