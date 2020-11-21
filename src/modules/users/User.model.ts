import { BeforeCreate, Column, DataType, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import { v4 } from 'uuid'

@Table({
  tableName: "user",
  updatedAt: false
})
export default class User extends Model<User> {
  @PrimaryKey
  @Column({type: DataType.UUID})
  id: ReturnType<typeof v4>;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name: String;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  email: String;

  @BeforeCreate({name: 'generateUUID'})
  static generateUUID(user: User) {
    user.id = v4()
  }
}