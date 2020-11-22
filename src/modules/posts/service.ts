import fetch from 'node-fetch'
import Subreddit from "../subreddit/Subreddit.model";

import * as xml2js from 'xml2js';

interface RSSFeed {
  feed: {
    logo: [string]
    title: [string]
    subtitle: [string]
    entry: {
      "media:thumbnail"?: {
        $: { url: string }
      }[]
      link: {
        $: { href: string }
      }[]
      title: [string]
    }[]
  }
}

interface SubredditPost {
  thumbnail?: string
  link: string
  title: string
}

interface SubredditState {
  link: string
  logo?: string
  title: string
  subtitle?: string
  posts: SubredditPost[]
}

const POSTS_PER_SUBREDDIT = 3

export const getTopPostsInLastDay = async (subreddit: Subreddit) => {
  const topPostsRssURL = `${subreddit.url}/top/.rss?t=day`
  const result = await fetch(topPostsRssURL)
  const xml = await result.text()
  const feed: RSSFeed = await xml2js.parseStringPromise(xml)
  return getTopPostsFromFeed(subreddit, feed)
}

const getTopPostsFromFeed = (subreddit: Subreddit, {feed}: RSSFeed): SubredditState => {
  const getFirst = (item?: any[]) => item && item[0]
  return {
    link: subreddit.url,
    logo: getFirst(feed.logo),
    title: getFirst(feed.title),
    subtitle: getFirst(feed.subtitle),
    posts: feed.entry.slice(0, POSTS_PER_SUBREDDIT).map(entry => {
      return ({
        thumbnail: getFirst(entry["media:thumbnail"])?.$.url,
        link: entry.link[0].$.href,
        title: getFirst(entry.title)
      });
    })
  }
}