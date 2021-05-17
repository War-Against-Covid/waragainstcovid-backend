import { ReqLogger } from '../../src/utils/logger';

/* eslint-disable */
declare global {
    namespace Express {
        export interface Request {
            log: typeof ReqLogger
        }
    }
}