import { xml } from "../fixtures/factorio-rss";

export default async () => {
  return {
    text: () => xml
  }
}