/* eslint-disable arrow-body-style */
import { validate, ValidatorOptions } from 'class-validator';
import bcrypt from 'bcrypt';
import AdminBro from 'admin-bro';
import { AuthenticationOptions } from '@admin-bro/express';
import { plainToClass } from 'class-transformer';
import { unflatten } from 'flat';
import RequestError from './RequestError';
import { User, UserModel } from '../Model/User';
import { BCRYPT_HASH_RATE } from './constants';
import {
    Lead, LeadModel, Resource, Plasma, VerificationState,
} from '../Model/Leads';
import { getCities, getStates } from '../Controller/data';

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
            edit: { isAccessible: ({ currentAdmin }: {currentAdmin: User}) => currentAdmin && currentAdmin.type === 'admin' },
            delete: { isAccessible: ({ currentAdmin }: {currentAdmin: User}) => currentAdmin && currentAdmin.type === 'admin' },
            list: { isAccessible: ({ currentAdmin }: {currentAdmin: User}) => currentAdmin && currentAdmin.type === 'admin' },
            new: {
                isAccessible: ({ currentAdmin }: {currentAdmin: User}) => currentAdmin && currentAdmin.type === 'admin',
                before: async (request: any) => {
                    if (request.payload.password) {
                        request.payload = {
                            ...request.payload,
                            // eslint-disable-next-line max-len
                            encryptedPassword: await bcrypt.hash(request.payload.password, BCRYPT_HASH_RATE),
                            password: undefined,
                        };
                    }
                    const userObj = unflatten(request.payload) as {};
                    const user = plainToClass(User, {
                        ...userObj,
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
            state: {
                availableValues: getStates().map((value) => ({ value, label: value })),
            },
            city: {
                availableValues: getCities().map((value) => ({ value, label: value })),
            },
            resource: {
                isVisible: {
                    list: true, edit: true, filter: true, show: true,
                },
                // eslint-disable-next-line max-len
                availableValues: Object.values(Resource).map((value) => ({ value, label: value })),
            },
            plasma: {
                // eslint-disable-next-line max-len
                availableValues: Object.values(Plasma).map((value) => ({ value, label: value })),
            },
            verificationState: {
                // eslint-disable-next-line max-len
                availableValues: Object.values(VerificationState).map((value) => ({ value, label: value })),
            },
            verifiedOn: {
                // eslint-disable-next-line object-curly-newline
                isVisible: { list: false, filter: true, show: true, edit: false },
            },
            lastUpdated: {
                // eslint-disable-next-line object-curly-newline
                isVisible: { list: false, filter: true, show: true, edit: false },
            },
            updatedBy: {
                // eslint-disable-next-line object-curly-newline
                isVisible: { list: false, filter: true, show: true, edit: false },
            },
            createdOn: {
                // eslint-disable-next-line object-curly-newline
                isVisible: { list: false, filter: true, show: true, edit: false },
            },
        },
        actions: {
            delete: { isAccessible: ({ currentAdmin }: {currentAdmin: User}) => currentAdmin && currentAdmin.type === 'admin' },
            new: {
                // eslint-disable-next-line max-len
                before: async (request: any, { currentAdmin }: { currentAdmin: User }) => {
                    if (request.method !== 'post') return request;
                    const leadObj = unflatten(request.payload) as {};

                    const defaults: any = {
                        // All newly created leads are set to unverified.
                        verificationState: VerificationState.notVerified,
                        verifiedOn: undefined,
                        lastUpdated: undefined,
                        updatedBy: currentAdmin.username,
                        createdOn: new Date(),
                    };

                    const lead = plainToClass(Lead, {
                        ...leadObj,
                        ...defaults,
                    });
                    await validateObject(lead);
                    request.payload = {
                        ...request.payload,
                        ...defaults,
                    };
                    return request;
                },
            },
            edit: {
                before: async (request: any, { currentAdmin }: { currentAdmin: User }) => {
                    if (request.method !== 'post') return request;
                    const leadObj = unflatten(request.payload) as {};
                    const defaults: any = {
                        // eslint-disable-next-line max-len
                        verifiedOn: request.payload.verificationState === VerificationState.verified ? new Date() : undefined,
                        lastUpdated: new Date(),
                        updatedBy: currentAdmin.username,
                    };

                    const lead = plainToClass(Lead, {
                        ...leadObj,
                        ...defaults,
                    });

                    await validateObject(lead);
                    request.payload = {
                        ...request.payload,
                        ...defaults,
                    };
                    return request;
                },
            },
        },
    },
};

export const setupAdminDashboard = async () => {
    return new AdminBro({
        resources: [userResource, leadResource],
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
