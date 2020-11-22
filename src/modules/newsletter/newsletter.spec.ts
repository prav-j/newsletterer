import { resetDB } from "../../db";
import { emailNewsletterForUser } from "./service";
import { getApp } from "../../app";
import { UUID } from "../../types/UUID";
import * as supertest from "supertest";
import * as emailAPI from '../../api/emailService'

jest.mock('node-fetch')
jest.mock('../../api/emailService')

const request = supertest(getApp())

describe('Newsletter creation', () => {
  beforeEach(resetDB)
  afterAll(resetDB)

  let user: UUID
  beforeEach(async () => {
    jest.resetAllMocks()
    user = await request
      .post('/users')
      .send({
        name: 'test',
        email: 'test@some.com'
      })
      .then(response => response.body.data.id)
    await request.post('/subreddits/investing/subscribe').send({user})
    await request.post('/subreddits/eyebleach/subscribe').send({user})
    await request.post('/subreddits/factorio/subscribe').send({user})
  })

  it('should create newsletter', async () => {
    const subredditTest = (name: string) => {
      return expect.objectContaining({
        url: `https://www.reddit.com/r/${name}`,
        posts: expect.arrayContaining([{
          link: expect.any(String),
          thumbnail: expect.any(String),
          title: expect.any(String),
        }, {
          link: expect.any(String),
          thumbnail: undefined,
          title: expect.any(String),
        }])
      })
    }
    const newsletter = await emailNewsletterForUser(user)
    expect(emailAPI.emailNewsletter).toBeCalledWith(newsletter)
    expect(newsletter).toEqual(expect.objectContaining({
      user: 'test',
      email: 'test@some.com',
      subreddits: expect.arrayContaining([
        subredditTest('investing'),
        subredditTest('eyebleach'),
        subredditTest('factorio'),
      ]),
    }))
  })

  it('should not create newsletter if user has disabled it', async () => {
    await request.put(`/users/${user}`).send({schedule: {isEnabled: false}})
    const newsletter = await emailNewsletterForUser(user)
    expect(emailAPI.emailNewsletter).not.toBeCalled()
    expect(newsletter).toEqual(undefined)
  })
})