/* eslint-disable import/first */
import * as dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import mongoose from 'mongoose';
import { plainToClass } from 'class-transformer';
import { validateObject } from './utils/utils';
import { ENV } from './utils/constants';
import { ErrorHandler, logger, ReqLogger } from './utils/logger';
import RequestError from './utils/RequestError';
import { User, UserModel } from './Model/User';

const app = express();

app.use(express.json());
app.use(cors());
app.use((req, _, next) => {
    req.log = ReqLogger;
    next();
});

// Routes to be called when DB Connection was successful.
const loadRoutes = () => {
    app.get('/api/ping', async (req, res) => {
        req.log('seems to be working');
        res.json({
            status: 'success',
            message: 'Pinged!',
        });
    });

    // Example on how to use class-transformer & class-validator with typegoose.
    app.get('/test', async (req, res) => {
        const user = plainToClass(User, {
            name: 'test5',
            password: '1234',
        });
        req.log(user);
        await validateObject(user); // will fail
        const doc = await UserModel.create(user);
        req.log(doc);
        res.json({});
    });

    // Unsupported Routes
    app.use(() => {
        throw new RequestError(404, 'Cannot find this Route!');
    });
    // Error Handling for any other error
    app.use(ErrorHandler);
};

// Will redirect all routes to this if DB Connection fails
const loadErrorFallback = (internalError: Error) => {
    app.use(() => {
        logger.info('Received req while server crashed');
        throw internalError;
    });
    app.use(ErrorHandler);
};

if (process.env.NODE_ENV !== ENV.TEST) {
    const port = process.env.PORT || 8080;
    app.listen(port, async () => {
        logger.info(`Started server on Port: ${port}`);
        try {
            await mongoose.connect(process.env.DB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
            });
            loadRoutes();
        } catch (err) {
            // Log error, redirect all routes to 500.
            loadErrorFallback(err);
            logger.error(`\nError connecting to DB:\n${err}`);
        }
    });
} else {
    loadRoutes();
}

export default app;
