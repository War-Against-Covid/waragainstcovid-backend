/* eslint-disable arrow-body-style */
import bcrypt from 'bcrypt';
import AdminBro from 'admin-bro';
import { AuthenticationOptions } from '@admin-bro/express';
import uploadFeature from '@admin-bro/upload';
import { plainToClass } from 'class-transformer';
import { unflatten } from 'flat';
import { User, UserModel } from '../Model/User';
import { Lead, LeadModel } from '../Model/Leads';
import { getCities, getStates } from '../Controller/data';
import { validateAdminBro } from '../utils';
import {
    BCRYPT_HASH_RATE, ENV, Plasma, Resource, VerificationState,
} from '../utils/constants';
import { SourcesModel } from '../Model/Sources';
import CustomImgUpload from '../utils/ImageRiderProvider';
import { ContactModel } from '../Model/Contact';
import { ContributeModel } from '../Model/Contribute';
import { Need, NeedModel } from '../Model/Need';

const sourcesResource = {
    resource: SourcesModel,
    options: {
        actions: {
            edit: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            bulkDelete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            delete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            list: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            new: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
        },
    },
};

const contactResource = {
    resource: ContactModel,
    options: {
        actions: {
            edit: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            bulkDelete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            delete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            list: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            new: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
        },
    },
};

const needResource = {
    resource: NeedModel,
    options: {
        properties: {
            prescriptionUrl: {
                mimeType: {},
                isVisible: {
                    edit: false,
                },
            },
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
                components: {
                    list: AdminBro.bundle('./Custom/ListLabel'),
                },
                custom: {
                    listName: 'resource',
                    breakAfter: 1,
                },
                // eslint-disable-next-line max-len
                availableValues: Object.values(Resource).map((value) => ({ value, label: value })),
            },
            contact: {
                components: {
                    list: AdminBro.bundle('./Custom/ListLabel'),
                },
                custom: {
                    listName: 'contact',
                    breakAfter: 1,
                },
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
            bulkDelete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            delete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            new: {
                before: async (request: any, { currentAdmin }: { currentAdmin: User }) => {
                    const req = unflatten(request.payload) as any;
                    if (Array.isArray(req?.contact)) {
                        // replace all non-phone numbers
                        req.contact = req.contact.map((elem: number|string) => elem.toString().replace(/[^0-9]/g, ''));
                    }
                    const needObj = req as any;
                    const need = plainToClass(Need, {
                        ...needObj,
                        updatedBy: currentAdmin.username,
                        createdOn: new Date(),
                    });
                    await validateAdminBro(need);
                    request.payload = {
                        ...req,
                        ...need,
                    };
                    return request;
                },
            },
            edit: {
                before: async (request: any, { currentAdmin }: { currentAdmin: User }) => {
                    if (request.method !== 'post') return request;
                    const needObj = unflatten(request.payload) as {};
                    const defaults: any = {
                        // eslint-disable-next-line max-len
                        lastUpdated: new Date(),
                        updatedBy: currentAdmin.username,
                    };

                    const need = plainToClass(Need, {
                        ...needObj,
                        ...defaults,
                    });

                    await validateAdminBro(need);
                    request.payload = {
                        ...request.payload,
                        ...defaults,
                    };
                    return request;
                },
            },
        },
    },
    features: [uploadFeature({
        provider: new CustomImgUpload({ bucket: 'uploads' }),
        validation: {
            mimeTypes: ['image/png', 'image/jpeg'],
            maxSize: 10e+6,
        },
        properties: {
            key: 'prescriptionUrl',
            mimeType: 'mimeType',
        },
    })],
};

const contributeResource = {
    resource: ContributeModel,
    options: {
        actions: {
            edit: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            bulkDelete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            delete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            list: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            new: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
        },
    },
};

const userResource = {
    resource: UserModel,
    options: {
        // eslint-disable-next-line max-len
        // editProperties: ['fullName', 'Instagram', 'username', 'password', 'mimeType', 'linkedIn', 'type'],
        properties: {
            imageUrl: {
                mimeType: {},
                isVisible: {
                    edit: false,
                },
            },
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
            edit: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            delete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            list: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            new: {
                isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin',
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
                    await validateAdminBro(user);
                    return request;
                },
            },
        },
    },
    features: [uploadFeature({
        provider: new CustomImgUpload({ bucket: 'uploads/user' }),
        validation: {
            mimeTypes: ['image/png', 'image/jpeg'],
            maxSize: 10e+6,
        },
        properties: {
            key: 'imageUrl',
            mimeType: 'mimeType',
        },
    })],
};

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
                components: {
                    list: AdminBro.bundle('./Custom/ListLabel'),
                },
                custom: {
                    listName: 'resource',
                    breakAfter: 1,
                },
                // eslint-disable-next-line max-len
                availableValues: Object.values(Resource).map((value) => ({ value, label: value })),
            },
            plasma: {
                isVisible: {
                    list: false, edit: true, filter: true, show: true,
                },
                // Hiding plasma
                // components: {
                //     list: AdminBro.bundle('./Custom/ListLabel'),
                // },
                // custom: {
                //     listName: 'plasma',
                // },

                // eslint-disable-next-line max-len
                availableValues: Object.values(Plasma).map((value) => ({ value, label: value })),
            },
            verificationState: {
                // eslint-disable-next-line max-len
                availableValues: Object.values(VerificationState).map((value) => ({ value, label: value })),
            },
            contact: {
                components: {
                    list: AdminBro.bundle('./Custom/ListLabel'),
                },
                custom: {
                    listName: 'contact',
                    breakAfter: 1,
                },
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
            'source.sourceName': {
                // eslint-disable-next-line object-curly-newline
                isVisible: { list: true, filter: true, show: false, edit: false },
            },
            createdOn: {
                // eslint-disable-next-line object-curly-newline
                isVisible: { list: false, filter: true, show: true, edit: false },
            },
        },
        actions: {
            bulkDelete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            delete: { isAccessible: ({ currentAdmin }: { currentAdmin: User }) => currentAdmin && currentAdmin.type === 'admin' },
            new: {
                // eslint-disable-next-line max-len
                before: async (request: any, { currentAdmin }: { currentAdmin: User }) => {
                    if (request.method !== 'post') return request;

                    const req = unflatten(request.payload) as any;
                    if (Array.isArray(req?.contact)) {
                        // replace all non-phone numbers
                        req.contact = req.contact.map((elem: number|string) => elem.toString().replace(/[^0-9]/g, ''));
                    }
                    if (!req?.plasma) {
                        req.plasma = [];
                    }
                    const leadObj = req as any;

                    const defaults: any = {
                        // All newly created leads are set to unverified.
                        // eslint-disable-next-line max-len
                        verificationState: req.verificationState ? req.verificationState : VerificationState.notVerified,
                        verifiedOn: undefined,
                        lastUpdated: undefined,
                        updatedBy: currentAdmin.username,
                        source: process.env.NODE_ENV === ENV.PROD ? '60bb881baef9fc5f5c0ddcf3' : undefined, // Source is WAC
                        createdOn: new Date(),
                    };

                    const lead = plainToClass(Lead, {
                        ...leadObj,
                        ...defaults,
                    });
                    await validateAdminBro(lead);
                    request.payload = {
                        ...req,
                        ...defaults,
                    };
                    return request;
                },
            },
            edit: {
                before: async (request: any, { currentAdmin }: { currentAdmin: User }) => {
                    if (request.method !== 'post') return request;
                    const req = unflatten(request.payload) as any;
                    if (Array.isArray(req?.contact)) {
                        // replace all non-phone numbers
                        req.contact = req.contact.map((elem: number|string) => elem.toString().replace(/[^0-9]/g, ''));
                    }
                    if (!req?.plasma) {
                        req.plasma = [];
                    }
                    const leadObj = req as any;

                    const defaults: any = {
                        // eslint-disable-next-line max-len
                        verifiedOn: req.verificationState === VerificationState.verified ? new Date() : undefined,
                        lastUpdated: new Date(),
                        updatedBy: currentAdmin.username,
                    };

                    const lead = plainToClass(Lead, {
                        ...leadObj,
                        ...defaults,
                    });

                    await validateAdminBro(lead);
                    request.payload = {
                        ...req,
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
        // eslint-disable-next-line max-len
        resources: [userResource, leadResource, sourcesResource, contributeResource, contactResource, needResource],
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
