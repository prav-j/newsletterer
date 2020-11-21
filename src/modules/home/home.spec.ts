import * as supertest from "supertest";
import { app } from "../../app";
import { resetDB } from "../../models/base";

const request = supertest(app)

describe("Home Page", () => {
  beforeAll(resetDB)

  it('should return 200', () => {
    return request.get("/").expect(200)
  })
})