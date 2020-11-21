import { config } from "dotenv";

export default () => {
  config()

  const env: string = (process.env.NODE_ENV || '').toLowerCase();
  if (!env) {
    throw new Error('Node environment is missing!')
  }
  return {
    env,
    ...((require(`./${env}.js`))(process.env))
  };
}