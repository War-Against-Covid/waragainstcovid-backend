import { ValidationError } from 'admin-bro';
import { validate, ValidatorOptions } from 'class-validator';
import RequestError from './RequestError';

export const validateObject = async (object: object, validatorOptions?: ValidatorOptions) => {
    const errors = await validate(object, validatorOptions);
    if (errors.length !== 0) {
        throw new RequestError(400, `validation failed, errors: ${errors}`);
    }
};

export const validateAdminBro = async (object: object, validatorOptions?: ValidatorOptions) => {
    const errors = await validate(object, validatorOptions);
    if (errors) {
        const err: {[key: string]: any} = {};
        errors.forEach((error) => {
            err[error.property] = {
                message: error.toString(),
            };
        });
        throw new ValidationError(err);
    }
};

export default {};
