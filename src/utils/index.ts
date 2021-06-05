import { ValidationError } from 'admin-bro';
import multer from 'multer';
import { v1 as uuid } from 'uuid';
import { validate, ValidatorOptions } from 'class-validator';
import { logger } from './logger';
import RequestError from './RequestError';

const MIME_TYPE_MAP: any = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

export const singleFileUpload = (path: string, folderName: string) => multer({
    storage: multer.diskStorage({
        destination: (req, file, cb: any) => {
            cb(null, path);
        },
        filename: (req, file, cb) => {
            const ext: string = MIME_TYPE_MAP[file.mimetype];
            cb(null, `${uuid()}.${ext}`);
        },
    }),
    limits: { fileSize: 12_000_000 }, // ~ 10MB
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        const error: any = isValid ? null : new Error('Invalid mime type!');
        cb(error, isValid);
    },
}).single(folderName);

export const validateObject = async (object: object, validatorOptions?: ValidatorOptions) => {
    const errors = await validate(object, validatorOptions);
    if (errors.length !== 0) {
        throw new RequestError(400, `validation failed, errors: ${errors}`);
    }
};

export const validateAdminBro = async (object: object, validatorOptions?: ValidatorOptions) => {
    const errors = await validate(object, validatorOptions);
    if (errors.length > 0) {
        const err: {[key: string]: any} = {};
        errors.forEach((error) => {
            err[error.property] = {
                message: error.toString(),
            };
        });
        logger.error(err);
        throw new ValidationError(err);
    }
};

export default {};
