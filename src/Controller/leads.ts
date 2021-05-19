/* eslint-disable no-underscore-dangle */
import { Request, Response } from 'express';
import { classToPlain, plainToClass } from 'class-transformer';
import {
    Lead,
    LeadModel,
    VerificationState,
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

export async function queryLead(req: Request, res: Response) {
    const queries = [...new Set((req.query?.q as string).split(', '))]; // This removes duplicates.
    req.log({
        queries,
    });
    const keywordRegex = new RegExp(queries.map((q) => (`(${q})`)).join('|'), 'gi');

    const data = classToPlain(await LeadModel.find({}).lean());

    const result = data.filter((doc: any) => {
        const groupsFound = new Set();
        // eslint-disable-next-line no-restricted-syntax
        for (const key of Object.keys(doc)) {
            const objValue = doc[key];
            if (keywordRegex.test(objValue)) {
                const matches: string[] = [];
                if (typeof objValue === 'object') {
                    Object.values(objValue).forEach((val) => {
                        if (typeof val === 'string' || typeof val === 'number') {
                            matches.push(...(String(val).match(keywordRegex) || []).map((e: any) => e.replace(keywordRegex, '$1')));
                        }
                    });
                } else if (typeof objValue === 'string' || typeof objValue === 'number') {
                    matches.push(...((String(objValue).match(keywordRegex) || []).map((e: any) => e.replace(keywordRegex, '$1'))));
                }
                matches.forEach((match) => {
                    groupsFound.add(match);
                });
            }
        }
        return groupsFound.size === queries.length;
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
