import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { Lead, LeadModel, VerificationState } from '../Model/Leads';
import RequestError from '../utils/RequestError';
import { validateObject } from '../utils/utils';

export async function getAllLeads(_: Request, res: Response) {
    const data = await LeadModel.find({});
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
    const data = await LeadModel.findById(req?.params?.id);

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
    });

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
