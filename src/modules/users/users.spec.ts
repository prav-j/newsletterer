import * as supertest from "supertest";
import { app } from "../../app";
import { resetDB } from "../../models/base";

const request = supertest(app)

describe('Create user', () => {
  beforeEach(async () => resetDB())
  afterAll(async () => resetDB())

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

  it('should create valid user', () => {
    return request.post('/users')
      .send({name: 'name', email: 'something@somewhere.com'})
      .expect(201)
  })
})

describe('Get users', () => {
  beforeEach(async () => resetDB())
  afterAll(async () => resetDB())

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