import * as supertest from "supertest";
import { getApp } from "../../app";
import { resetDB } from "../../db";

const request = supertest(getApp())

describe("Home Page", () => {
  beforeEach(resetDB)
  afterAll(resetDB)

  it('should return 200', () => {
    return request.get("/").expect(200)
  })
})