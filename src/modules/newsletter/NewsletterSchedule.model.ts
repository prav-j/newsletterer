import {
  BeforeSave,
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
import { computeNextNewsletterTime } from "./service";
import { DateTime } from "luxon";

@Table({
  tableName: 'newsletter_schedules',
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
  nextScheduledAt?: number

  @BelongsTo(() => User)
  user: User

  @BeforeSave
  static async scheduleNext(schedule: NewsletterSchedule) {
    if (!schedule.isEnabled) {
      schedule.nextScheduledAt = undefined
      return
    }
    schedule.nextScheduledAt = computeNextNewsletterTime(schedule.newsletterSendTime, schedule.timezone)
    return schedule
  }

  format() {
    return {
      isEnabled: this.isEnabled,
      nextScheduledAt: this.nextScheduledAt ? DateTime.fromMillis(this.nextScheduledAt * 1000)
        .setZone(this.timezone)
        .toISO() : null,
      newsletterSendTime: this.newsletterSendTime,
      timezone: this.timezone
    }
  }
}