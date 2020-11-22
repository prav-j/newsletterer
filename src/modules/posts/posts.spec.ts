import { getTopPostsInLastDay } from "./service";
import Subreddit from "../subreddit/Subreddit.model";
import { resetDB } from "../../db";

jest.mock('node-fetch')

describe('Fetch posts', () => {
  beforeEach(resetDB)
  afterAll(resetDB)

  it('should fetch top posts', async () => {
    const posts = await getTopPostsInLastDay(Subreddit.build({name: 'test'}))
    expect(posts).toMatchSnapshot()
  })
})