import { BeforeCreate, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import User from "../users/User.model";
import { Transaction } from "sequelize";
import { DateTime } from "luxon";

@Table({
  tableName: 'scheduled_newsletters',
  createdAt: false,
  updatedAt: false
})
export default class NewsletterSchedule extends Model<NewsletterSchedule> {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({type: DataType.UUID})
  userId: User["id"]

  @Column
  lastSentAt?: number

  @Column
  nextScheduledAt?: number

  @BelongsTo(() => User)
  user: User

  @BeforeCreate
  static async scheduleNext(schedule: NewsletterSchedule) {
    const user = await schedule.$get('user')
    if(!user){
      return
    }
    schedule.lastSentAt = DateTime.local().toSeconds()
    schedule.nextScheduledAt = computeNextNewsletterTime(user.newsletterSendTime, user.timezone)
  }

  async markSentAndScheduleNext(transaction?: Transaction) {
    await this.update({
      lastSentAt: DateTime.local().toSeconds(),
      nextScheduledAt: computeNextNewsletterTime(this.user.newsletterSendTime, this.user.timezone)
    }, {transaction})
  }

  async cancelScheduled(transaction?: Transaction) {
    await this.update({
      nextScheduledAt: null
    }, {transaction})
  }
}

const computeNextNewsletterTime = (newsletterSendTime: string, timezone: string) => {
  const nextTimestampISO = `${DateTime.local().toFormat("yyyy-MM-dd")}T${newsletterSendTime}`
  const nextTime = DateTime.fromISO(nextTimestampISO, {zone: timezone})
  if (nextTime.diffNow().milliseconds < 0) {
    return nextTime.plus({hours: 24}).toSeconds()
  }
  return nextTime.toSeconds()
}