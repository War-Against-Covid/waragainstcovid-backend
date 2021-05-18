import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
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
        state: req.query.state || '',
        city: req.query.city || '',
        resource: req.query.resource || '',
        plasma: req.query.plasma || '',
        keyword: req.query.keyword || '',
    };
    const data = await LeadModel.find({
        $or: [
            { state: query.state as string },
            { city: query.city as string },
            { resource: query.resource as Resource },
            { plasma: query.plasma as Plasma },
        ],
    }).lean();

    const response = data.map((d) => {
        if (d.rawText) {
            if (d.rawText.includes(query.keyword as string)) {
                return d;
            }
            return null;
        }
        return d;
    });

    res.json({
        status: 'success',
        message: 'Leads found',
        lead: response,
    });
}
