/* eslint-disable max-len */
import { STATUS_CODES } from 'http';
import { NextFunction, Request, Response } from 'express';
import Logger from 'pino';
import fs from 'fs';
import RequestError from './RequestError';

export const logger = Logger();

// eslint-disable-next-line no-unused-vars
export const ErrorHandler = (error: RequestError | any, req: Request, res: Response, next: NextFunction) => {
    let body = req.body || {};
    if (req.query) body = { ...body, ...req.query };
    // include params in /tracking/<id:string>
    if (req.params) body = { ...body, ...req.params };

    if (req.file) {
        logger.info('Removing file', req.file);
        fs.unlink(req.file.path, (err: any) => {
            logger.error(`Error while unlinking file: ${err}`);
        });
    }

    // eslint-disable-next-line no-param-reassign

    let code = error?.code || error?.status || 500;
    if (typeof code !== 'number') code = 500;
    const errorMessage = error?.message || 'unknown';

    // capture type errors
    if (error instanceof TypeError || typeof error?.code === 'undefined') {
        // TypeErrors are caused by faulty code.
        // It is the responsibility of a dev to fix them
        // Sentry allows us to manage errors and assign them to team members
        // in order to fix/debug them etc.

        // Use Sentry only when working on a big project.
        // Sentry is paid.

        // Sentry.captureException(error, {
        //     extra: {
        //         path: mPath,
        //         params: { ...req.body, ...req.query },
        //     },
        // });
    }
    res.status(code).json({
        code,
        error: errorMessage,
        message: STATUS_CODES[code],
    });
    const method = code >= 400 ? 'error' : 'info';
    const mPath = `${req.method} ${req.path}`;
    if (code >= 500) {
        logger[method]({
            path: mPath,
            headers: req.headers,
            body,
            error: errorMessage,
            trace: error?.stack?.toString(),
            ip: req.ip,
        });
    }
};

// it logs more detailed Request logs, compared to console.log
export function ReqLogger(this: Request, message: any) {
    const mPath = `${this.method} ${this.path}`;
    logger.info({
        message,
        path: mPath,
        headers: this.headers,
        ip: this.ip,
    });
}
