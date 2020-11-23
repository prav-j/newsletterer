## Installation Instructions

- Have Postgres installed
- In the cloned repo directory, run `yarn`
- Add your postgres config to `src/config/development.js`
- You can create custom environments if you wish, just add the corresponding config in the `config` folder.

## Running the application

- Start postgres and ensure that the DB connection string in the config file is accurate
- `NODE_ENV=development yarn start` will start a watcher, which builds and automatically reloads on code change. `NODE_ENV` is mandatory!
- This also starts the newsletter scheduler, which checks every 30 seconds to see if there are any users to whom we should send a newsletter. 
- `yarn test:watch` starts a test watcher, which runs tests automatically when there are changes.

You're ready to go! The API is at `localhost:3000` or on whichever port you specify in the `.env` file.