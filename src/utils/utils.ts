import { validate, ValidatorOptions } from 'class-validator';
import RequestError from './RequestError';

export const validateObject = async (object: object, validatorOptions?: ValidatorOptions) => {
    const errors = await validate(object, validatorOptions);
    if (errors) {
        throw new RequestError(400, `validation failed, errors: ${errors}`);
    }
};

export default {};
