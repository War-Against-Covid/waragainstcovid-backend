/* eslint-disable import/first */
import * as dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import 'express-async-errors';
// eslint-disable-next-line import/no-extraneous-dependencies
import expressStatusMonitor from 'express-status-monitor';
import cors from 'cors';
import mongoose from 'mongoose';
import AdminBro from 'admin-bro';
import swaggerUI from 'swagger-ui-express';
import AdminBroMongoose from '@admin-bro/mongoose';
import AdminBroExpress from '@admin-bro/express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import session from 'express-session';
import redis from 'redis';
import connectRedis from 'connect-redis';
import { ENV } from './utils/constants';
import { ErrorHandler, logger, ReqLogger } from './utils/logger';
import RequestError from './utils/RequestError';
import swaggerDoc from './openapi.json';
import leadRoutes from './Routes/leads';
import dataRoutes from './Routes/data';
import formRoutes from './Routes/forms';
import { adminDashOps, setupAdminDashboard } from './utils/adminBro';

AdminBro.registerAdapter(AdminBroMongoose);

const app = express();

app.set('trust proxy', 1); // Trust reverse-proxy when using cookies with https

app.use(express.json());

let RedisStore: any = null;
let redisClient: any = null;
if (process.env.NODE_ENV === ENV.PROD) {
    RedisStore = connectRedis(session);
    // Configure redis client
    redisClient = redis.createClient({
        password: process.env.REDIS_PASS,
    });

    redisClient.on('error', (err: any) => {
        logger.info(`Could not establish a connection with redis. ${err}`);
    });
    redisClient.on('connect', () => {
        logger.info('Connected to redis successfully');
    });
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// not a silver bullet, but helps
app.use(
    helmet(
        process.env.NODE_ENV !== ENV.PROD
            ? { contentSecurityPolicy: false }
            : {},
    ),
);

app.use(cors());

app.use((req, _, next) => {
    req.log = ReqLogger;
    next();
});

// Routes to be called when DB Connection was successful.
const loadRoutes = () => {
    // AdminBro causes problems when loading urlencoded middleware
    app.use(express.urlencoded({
        extended: true,
    }));
    const apiLimiter = rateLimit({
        // to use redis-store instead of default memory store,
        // install rate-limit-redis and uncomment the below lines

        // store: new RedisStore({}),
        windowMs: 2 * 60 * 1000, // 2 minutes
        max: 100,
    });
    if (process.env.NODE_ENV === ENV.DEV) {
        app.use(expressStatusMonitor());
    }
    // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    // see https://expressjs.com/en/guide/behind-proxies.html
    // app.set('trust proxy', 1);

    app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
    // added here just for demonstration purpose,
    // to be moved to /api/needs when it is ready
    app.use('/api/leads', apiLimiter, leadRoutes);
    app.use('/api/data', dataRoutes);
    app.use('/api/forms', formRoutes);

    app.get('/api/ping', async (req, res) => {
        req.log('seems to be working');
        res.json({
            status: 'success',
            message: 'Pinged!',
        });
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
            // eslint-disable-next-line max-len
            await mongoose.connect(
                process.env.NODE_ENV === ENV.PROD
                    ? process.env.DB_URL_PROD
                    : process.env.DB_URL,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true,
                },
            );
            const adminBro = await setupAdminDashboard();
            // const router = AdminBroExpress.buildRouter(adminBro);
            const router = AdminBroExpress.buildAuthenticatedRouter(
                adminBro,
                adminDashOps,
                null,
                process.env.NODE_ENV === ENV.PROD ? {
                    store: new RedisStore({ client: redisClient }),
                    proxy: true,
                    resave: false,
                    saveUninitialized: false,
                    cookie: {
                        secure: true,
                    },
                } as any : {
                    resave: false,
                    saveUninitialized: false,
                },
            );
            app.use(adminBro.options.rootPath, router);
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
