/* eslint-disable import/first */
import * as dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import mongoose from 'mongoose';
import AdminBro from 'admin-bro';
import swaggerUI from 'swagger-ui-express';
import AdminBroMongoose from '@admin-bro/mongoose';
import AdminBroExpress from '@admin-bro/express';
import helmet from 'helmet';
import { ENV } from './utils/constants';
import { ErrorHandler, logger, ReqLogger } from './utils/logger';
import RequestError from './utils/RequestError';
import swaggerDoc from './openapi.json';
import leadRoutes from './Routes/leads';
import dataRoutes from './Routes/data';
// import sampleRoute from './Routes/sample';
import { adminDashOps, setupAdminDashboard } from './utils/utils';

AdminBro.registerAdapter(AdminBroMongoose);

const app = express();

app.use(express.json());

// not a silver bullet, but helps
app.use(helmet(process.env.NODE_ENV !== ENV.PROD ? { contentSecurityPolicy: false } : {}));

app.use(cors());

app.use((req, _, next) => {
    req.log = ReqLogger;
    next();
});

// Routes to be called when DB Connection was successful.
const loadRoutes = () => {
    app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
    app.use('/api/leads', leadRoutes);
    app.use('/api/data', dataRoutes);

    // app.use('/api/sample', sampleRoute);

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
            await mongoose.connect(process.env.DB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
            });
            const adminBro = await setupAdminDashboard();
            const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, adminDashOps);
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
