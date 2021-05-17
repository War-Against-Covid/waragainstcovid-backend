import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { Lead, LeadModel, VerificationState } from '../Model/Lead';
import RequestError from '../utils/RequestError';
import { validateObject } from '../utils/utils';

export async function getAllLeads(_: Request, res: Response) {
    const data = await LeadModel.find({});
    if (!data) {
        throw new RequestError(404, 'No Leads Present');
    } else {
        res.json({
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
            data,
        });
    }
}

// TODO: change this to current POST /api/.
/**
 *  Current:
 *  POST /api/lead/
 *  payload: {
 *      text: "lorem ipsum", // Need to extract data from this text automatically
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
        verificationState: VerificationState.notVerified,
        verifiedOn: undefined,
        lastUpdated: undefined,
        updatedBy: undefined,
        createdOn: undefined,
        ...req.body,
    });
    lead.createdOn = new Date();
    await validateObject(lead);
    const doc = await LeadModel.create(lead);
    res.json({
        status: 'success',
        message: 'Lead Created',
        lead: doc,
    });
}
