import { ValidationError } from 'admin-bro';
import { validate, ValidatorOptions } from 'class-validator';
import { logger } from './logger';
import RequestError from './RequestError';

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
