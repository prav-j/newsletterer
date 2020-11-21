import { config } from "dotenv";

export default () => {
  config()
  const env: string = (process.env.NODE_ENV || "dev").toLowerCase();
  return {
    env,
    ...((require(`./${env}.js`))(process.env))
  };
}