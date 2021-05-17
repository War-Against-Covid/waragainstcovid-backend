/* eslint-disable arrow-body-style */
import { validate, ValidatorOptions } from 'class-validator';
import bcrypt from 'bcrypt';
import AdminBro from 'admin-bro';
import { AuthenticationOptions } from '@admin-bro/express';
import { plainToClass } from 'class-transformer';
import RequestError from './RequestError';
import { User, UserModel } from '../Model/User';
import { BCRYPT_HASH_RATE } from './constants';
import {
    Lead, LeadModel, Resource, Plasma, VerificationState,
} from '../Model/Lead';

export const validateObject = async (object: object, validatorOptions?: ValidatorOptions) => {
    const errors = await validate(object, validatorOptions);
    if (errors.length !== 0) {
        throw new RequestError(400, `validation failed, errors: ${errors}`);
    }
};

const userResource = {
    resource: UserModel,
    options: {
        properties: {
            encryptedPassword: {
                isVisible: false,
            },
            password: {
                type: 'string',
                isVisible: {
                    list: false, edit: true, filter: false, show: false,
                },
            },
        },
        actions: {
            new: {
                before: async (request: any) => {
                    if (request.payload.password) {
                        request.payload = {
                            ...request.payload,
                            // eslint-disable-next-line max-len
                            encryptedPassword: await bcrypt.hash(request.payload.password, BCRYPT_HASH_RATE),
                            password: undefined,
                        };
                    }
                    const user = plainToClass(User, {
                        ...request.payload,
                    });
                    await validateObject(user);
                    return request;
                },
            },
        },
    },
};

// TODO: Add custom validation and update fields like createdOn.
const leadResource = {
    resource: LeadModel,
    options: {
        properties: {
            resource: {
                // eslint-disable-next-line max-len
                availableValues: Object.values(Resource).map((value) => { return { value, label: value }; }),
            },
            plasma: {
                // eslint-disable-next-line max-len
                availableValues: Object.values(Plasma).map((value) => { return { value, label: value }; }),
            },
            verificationState: {
                // eslint-disable-next-line max-len
                availableValues: Object.values(VerificationState).map((value) => { return { value, label: value }; }),
            },
            verifiedOn: {
                isVisible: false,
            },
            lastUpdated: {
                isVisible: false,
            },
            updatedBy: {
                isVisible: false,
            },
            createdOn: {
                isVisible: false,
            },
        },
        actions: {
            new: {
                before: async (request: any) => {
                    const lead = plainToClass(Lead, {
                        // All newly created leads are set to unverified.
                        verificationState: VerificationState.notVerified,
                        verifiedOn: undefined,
                        lastUpdated: undefined,
                        updatedBy: undefined,
                        createdOn: new Date(),
                        ...request.payload,
                    });
                    await validateObject(lead);
                },
            },
        },
    },
};

export const setupAdminDashboard = async () => {
    return new AdminBro({
        resources: [userResource, leadResource],
        rootPath: '/',
    });
};

export const adminDashOps: AuthenticationOptions = {
    authenticate: async (email, password) => {
        const user = await UserModel.findOne({ username: email });
        if (user) {
            const matched = await bcrypt.compare(password, user.encryptedPassword);
            if (matched) return user;
        }
        return false;
    },
    cookiePassword: process.env.COOKIE_SECRET,
};
