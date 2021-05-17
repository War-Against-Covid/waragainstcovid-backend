# WarAgainstCOVID-backend
- Backend written for WarAgainstCOVID, an NGO working towards curating leads related to COVID-19.

## Info

<!-- - If using test MongoDb from Github Actions etc. set env.TEST_MONGO to "true". Otherwise Mocha will set up an in-memory mongodb on server start. -->
- Backend uses Express v4 with the `express-async-errors` library to wrap routes inside `next(err)` if an error is thrown. This will become obsolete once Express v5 is released and will be done by express itself and so the library may cause problems. So remove `express-async-errors` if upgrading to Express v5.
- Backend uses sophisticated logging and error-handling which the (@whats-poppin) team is very proud of.
- Set env.NODE_ENV to "PROD" when pushing to production. (As of now, `DEV`, `PROD` and undefined dont make a difference, NODE_ENV is set to `TEST` when running mocha tests)
- Tests not written for WarAgainstCOVID. Yet.

## Installation
- Install NodeJS 14.x (12.x is not supported becasue of lack of optionals)
- install typescipt using `npm i -g typescript`
- install dependencies using `npm i`
- Enter required env variables in `.env` file. Refer to `.env.sample` for details on what variables are expected.
- run development server using: `npm run dev` NOTE: dev script might not work in windows because of difference in executables. If you use windows, please conract @dramikei or install linux.

## Docs

Coming soon. Via Swagger-docs.