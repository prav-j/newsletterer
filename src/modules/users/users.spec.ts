import * as supertest from "supertest";
import { app } from "../../app";
import { resetDB } from "../../models/base";

const request = supertest(app)

describe('Create user', function () {
  beforeEach(async () => resetDB())

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