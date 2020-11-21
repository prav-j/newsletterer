import * as supertest from "supertest";
import { app } from "../../app";
import { resetDB } from "../../db";

const request = supertest(app)

describe("Home Page", () => {
  beforeEach(resetDB)
  afterAll(resetDB)

  it('should return 200', () => {
    return request.get("/").expect(200)
  })
})