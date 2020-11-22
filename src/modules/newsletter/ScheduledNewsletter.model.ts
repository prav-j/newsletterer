import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
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

  @Default(true)
  @Column
  isEnabled: boolean

  @Default("08:00:00")
  @Column({type: DataType.TIME})
  newsletterSendTime: string

  @Default("UTC")
  @Column
  timezone: string

  @Column
  lastSentAt?: number

  @Column
  nextScheduledAt?: number

  @BelongsTo(() => User)
  user: User

  @BeforeCreate
  static async scheduleNext(schedule: NewsletterSchedule) {
    if (!schedule.isEnabled) {
      return
    }
    schedule.lastSentAt = DateTime.local().toSeconds()
    schedule.nextScheduledAt = computeNextNewsletterTime(schedule.newsletterSendTime, schedule.timezone)
  }

  async markSentAndScheduleNext(transaction?: Transaction) {
    await this.update({
      lastSentAt: DateTime.local().toSeconds(),
      nextScheduledAt: computeNextNewsletterTime(this.newsletterSendTime, this.timezone)
    }, {transaction})
  }

  async cancelScheduled(transaction?: Transaction) {
    await this.update({
      nextScheduledAt: null
    }, {transaction})
  }

  format() {
    return {
      isEnabled: this.isEnabled,
      nextScheduledAt: this.nextScheduledAt,
      newsletterSendTime: this.newsletterSendTime,
      timezone: this.timezone
    }
  }
}

const computeNextNewsletterTime = (newsletterSendTime: string, timezone: string) => {
  const nextTimestampISO = `${DateTime.local().setZone(timezone).toFormat("yyyy-MM-dd")}T${newsletterSendTime}`
  const nextTime = DateTime.fromISO(nextTimestampISO, {zone: timezone})
  if (nextTime.diffNow().milliseconds < 0) {
    return nextTime.plus({hours: 24}).toSeconds()
  }
  return nextTime.toSeconds()
}