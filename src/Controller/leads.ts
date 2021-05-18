/* eslint-disable no-underscore-dangle */
import { Request, Response } from 'express';
import { classToPlain, plainToClass } from 'class-transformer';
import {
    Lead,
    LeadModel,
    VerificationState,
    Resource,
    Plasma,
} from '../Model/Leads';
import RequestError from '../utils/RequestError';
import { validateObject } from '../utils/utils';

export async function getAllLeads(_: Request, res: Response) {
    const data = await LeadModel.find({}).lean();
    if (!data) {
        throw new RequestError(404, 'No Leads Present');
    } else {
        res.json({
            status: 'success',
            leads: data,
        });
    }
}

export async function getLeadById(req: Request, res: Response) {
    const data = await LeadModel.findById(req?.params?.id).lean();

    if (!data) {
        throw new RequestError(404, 'Lead Not Found');
    } else {
        res.json({
            status: 'success',
            lead: data,
        });
    }
}

export async function getVerifiedLeads(req: Request, res: Response) {
    const today = new Date();

    const data = await LeadModel.find({
        verificationState: VerificationState.verified,
        verifiedOn: {
            $gte: new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
            $lt: new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1),
        },
    }).lean();

    res.json({
        status: 'success',
        leads: data,
    });
}

// TODO: change this to current POST /api/.
/**
 *  Current:
 *  POST /api/lead/
 *  payload: {
 *      text: "lorem ipsum", // Need to extract data from this text automatically
 *      source: "",
 *      contact: [
 *          "9876543211",
 *          "9988775545"
 *      ]
 *  }
 *
 */
export async function createLead(req: Request, res: Response) {
    const lead = plainToClass(Lead, {
        // All newly created leads are set to unverified.
        ...req.body,
        verificationState: VerificationState.notVerified,
        verifiedOn: undefined,
        lastUpdated: undefined,
        updatedBy: undefined,
        createdOn: new Date(),
    });
    await validateObject(lead);
    const doc = await LeadModel.create(lead);
    res.json({
        status: 'success',
        message: 'Lead Created',
        lead: doc,
    });
}
export async function queryLead(req:Request, res:Response) {
    const query = {
        state: req.query.state as string || '',
        city: req.query.city as string || '',
        resource: req.query.resource || '',
        plasma: req.query.plasma || '',
        keyword: req.query.keyword as string || '',
    };
    let data: any[];
    // get city specific leads, if city exists in the query
    if (query.city === '') {
        data = await LeadModel.find({
            verificationState: VerificationState.verified,
            state: query.state,
        }).lean();
    } else {
        data = await LeadModel.find({
            verificationState: VerificationState.verified,
            city: query.city,
        }).lean();
    }
    // eslint-disable-next-line no-underscore-dangle
    const ids = data.map((d) => d._id);

    // get the leads with mentioned resources/plasma
    const leads = await LeadModel.find({
        _id: {
            $in: ids,
        },
        $or: [
            { resource: query.resource as Resource },
            { plasma: query.plasma as Plasma },
        ],
    }).lean();
    // Check the leads for mentioned keywords
    const response = leads.map((lead) => {
        if (lead.rawText) {
            if (lead.rawText.includes(query.keyword)) {
                return lead;
            }
            return null;
        }
        return lead;
    });
    if (response.length !== 0) {
        res.json({
            status: 'success',
            message: 'Leads found',
            lead: response,
        });
    } else {
        res.json({
            status: 'Failed',
            message: 'No Leads Found',
        });
    }
}

export async function queryLead2(req: Request, res: Response) {
    const queries = req.query.q as string;
    const keywordregex = new RegExp(queries.split(', ').join('|'), 'g');

    const data = classToPlain(await LeadModel.find({}).lean());

    const result = data.filter((doc: any) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const key of Object.keys(doc)) {
            if (typeof key === 'string' && keywordregex.test(doc[key])) {
                return true;
            }
        }
        return false;
    });

    // Convert _id back to hex
    const final = result.map((elem: any) => {
        const temp = elem;
        temp._id = (temp._id.id as Buffer).toString('hex');
        return temp;
    });

    res.json({
        status: 'success',
        leads: final,
    });
}
