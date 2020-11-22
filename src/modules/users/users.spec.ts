import * as supertest from "supertest";
import { getApp } from "../../app";
import { resetDB } from "../../db";
import { UUID } from "../../types/UUID";

const request = supertest(getApp())

describe('Create user', () => {
  beforeEach(resetDB)
  afterAll(resetDB)

  describe('Validation', () => {
    it('should fail without name', () => {
      return request.post('/users')
        .send({email: 'something@somewhere.com'})
        .expect(400)
    })
    it('should fail without email', () => {
      return request.post('/users')
        .send({name: 'name'})
        .expect(400)
    })

    describe('Duplication', () => {
      beforeEach(() => {
        return request.post('/users')
          .send({name: 'name', email: 'something@somewhere.com'})
          .set('Accept', 'application/json')
      })
      it('should not create user with duplicate name', () => {
        return request.post('/users')
          .send({name: 'name', email: 'something2@somewhere.com'})
          .expect(400)
      })
      it('should not create user with duplicate email', () => {
        return request.post('/users')
          .send({name: 'name2', email: 'something@somewhere.com'})
          .expect(400)
      })
    })
  })

  it('should create valid user with default values', () => {
    return request.post('/users')
      .send({name: 'name', email: 'something@somewhere.com'})
      .expect(201)
      .then(res => {
        expect(res.body.data).toEqual(expect.objectContaining({
          name: 'name',
          email: 'something@somewhere.com',
          isNewsletterEnabled: true,
          newsletterSendTime: "08:00:00",
          timezone: "UTC"
        }));
      })
  })

  it('should create valid user with specified values', () => {
    return request.post('/users')
      .send({
        name: 'name',
        email: 'something@somewhere.com',
        isNewsletterEnabled: false,
        newsletterSendTime: "09:00:00",
        timezone: "Europe/Berlin"
      })
      .expect(201)
      .then(res => {
        expect(res.body.data).toEqual(expect.objectContaining({
          name: 'name',
          email: 'something@somewhere.com',
          isNewsletterEnabled: false,
          newsletterSendTime: "09:00:00",
          timezone: "Europe/Berlin"
        }));
      })
  })
})

describe('Get users', () => {
  beforeEach(resetDB)
  afterAll(resetDB)

  beforeEach(async () => {
    await request.post('/users').send({name: 'name1', email: 'something1@somewhere.com'})
    await request.post('/users').send({name: 'name2', email: 'something2@somewhere.com'})
  })
  it('should fetch all created users', () => {
    return request.get('/users')
      .expect((res => {
        expect(res.status).toBe(200)
        expect(res.body.data)
          .toEqual(expect.objectContaining([{
            id: expect.any(String),
            name: 'name1',
            email: 'something1@somewhere.com'
          }, {
            id: expect.any(String),
            name: 'name2',
            email: 'something2@somewhere.com'
          }]))
      }))
  })
})

describe('Fetch users', () => {
  beforeEach(resetDB)
  afterAll(resetDB)

  let user: UUID
  beforeEach(async () => {
    user = await request.post('/users')
      .send({name: 'name1', email: 'something1@somewhere.com'})
      .then(({body: {data: {id}}}) => id)
  })
  it('should fetch user', async () => {
    await request.get(`/users/${user}`)
      .expect(200, {
        data: {
          id: user,
          name: 'name1',
          email: 'something1@somewhere.com',
          isNewsletterEnabled: true,
          newsletterSendTime: '08:00:00',
          timezone: 'UTC'
        }
      })
  })

  it('should return 404 for unknown user', async () => {
    await request.get('/users/404user').expect(404)
  })
})

describe('Update user', () => {
  beforeEach(resetDB)
  afterAll(resetDB)

  let user1: UUID
  beforeEach(async () => {
    user1 = await request.post('/users')
      .send({name: 'name1', email: 'something1@somewhere.com'})
      .then(({body: {data: {id}}}) => id)
    await request.post('/users')
      .send({name: 'name2', email: 'something2@somewhere.com'})
      .then(({body: {data: {id}}}) => id)
  })

  it('should allow user to change their name and email', async () => {
    await request.put(`/users/${user1}`)
      .send({name: 'name1new', email: 'something1new@somewhere.com'})
      .expect(200, {
        data: {
          name: 'name1new',
          email: 'something1new@somewhere.com'
        }
      })
    await request.get(`/users/${user1}`)
      .expect(200)
      .then(response => expect(response.body.data).toEqual(expect.objectContaining({
        id: user1,
        name: 'name1new',
        email: 'something1new@somewhere.com'
      })))
  })

  it('should not allow name to collide with another user', async () => {
    await request.put(`/users/${user1}`)
      .send({name: 'name2'})
      .expect(400)
  })

  it('should not allow email to collide with another user', async () => {
    await request.put(`/users/${user1}`)
      .send({email: 'something2@somewhere.com'})
      .expect(400)
  })
})