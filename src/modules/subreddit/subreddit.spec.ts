import { resetDB } from "../../db";
import * as supertest from "supertest";
import { getApp } from "../../app";
import { UUID } from "../../types/UUID";
import { v4 } from "uuid";

const request = supertest(getApp())

describe("Subreddit", () => {
  beforeEach(resetDB)
  afterAll(resetDB)

  describe("Create", () => {
    it('should create a subreddit', async () => {
      await request.post('/subreddits/something201')
        .expect(201, {data: {name: 'something201', userCount: 0}})
    })
  })

  describe("Fetch", () => {
    beforeEach(async () => {
      await request.post('/subreddits/something200').expect(201)
    })

    it('should say not found for a non-existing subreddit', async () => {
      await request.get('/subreddits/something404').expect(404)
    })

    it('should fetch an existing subreddit', async () => {
      await request.get('/subreddits/something200')
        .expect(200, {data: {name: 'something200', userCount: 0}})
    })
  })

  describe("Subscription", () => {
    let userId: UUID
    beforeEach(async () => {
      userId = await request.post('/users')
        .send({name: 'test user', email: 'user@test.com'})
        .then(response => response.body.data.id);
    })

    it('should throw error on unknown user subscribing', async () => {
      const subredditName = 'someSubreddit';
      await request.post(`/subreddits/${subredditName}/subscribe`)
        .send({user: v4()})
        .expect(400)
    })

    it('should subscribe user to unknown subreddit', async () => {
      const subredditName = 'someSubreddit';
      await request.get(`/subreddits/${subredditName}`).expect(404)
      await request.post(`/subreddits/${subredditName}/subscribe`)
        .send({user: userId})
        .expect(200)
      await request.get(`/subreddits/${subredditName}`)
        .expect(200, {data: {name: subredditName, userCount: 1}})
    })

    it('should subscribe user to subreddit only once', async () => {
      const subredditName = 'someSubreddit';
      await request.post(`/subreddits/${subredditName}/subscribe`)
        .send({user: userId})
        .expect(200)
      await request.post(`/subreddits/${subredditName}/subscribe`)
        .send({user: userId})
        .expect(200)
      await request.get(`/subreddits/${subredditName}`)
        .expect(200, {data: {name: subredditName, userCount: 1}})
    })
  })

  describe('Unsubscription', () => {
    const subreddit = 'something201'
    let userId: UUID
    beforeEach(async () => {
      userId = await request.post('/users')
        .send({name: 'test user', email: 'user@test.com'})
        .then(response => response.body.data.id);
      await request.post(`/subreddits/${subreddit}`)
      await request.post(`/subreddits/${subreddit}/subscribe`).send({user: userId})
    })

    it('should throw error on unknown user unsubscribing', async () => {
      await request.post(`/subreddits/${subreddit}/unsubscribe`)
        .send({user: v4()})
        .expect(400)
    })

    it('should unsubscribe user from subreddit', async () => {
      await request.get(`/subreddits/${subreddit}`)
        .expect(200, {data: {name: subreddit, userCount: 1}})
      await request.post(`/subreddits/${subreddit}/unsubscribe`)
        .send({user: userId})
        .expect(200)
      await request.get(`/subreddits/${subreddit}`)
        .expect(200, {data: {name: subreddit, userCount: 0}})
    })

    it('should fail if subreddit does not exist', async () => {
      await request.post(`/subreddits/something404/unsubscribe`)
        .send({user: userId})
        .expect(404)
    })
  })
})