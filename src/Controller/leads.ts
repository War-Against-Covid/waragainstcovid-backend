/* eslint-disable no-underscore-dangle */
import { Request, Response } from 'express';
import { classToPlain, plainToClass } from 'class-transformer';
import { Lead, LeadModel } from '../Model/Leads';
import {
    Plasma, Resource, ResourceMatch, VerificationState,
} from '../utils/constants';
import RequestError from '../utils/RequestError';
import { validateObject } from '../utils';
import { getCities, getStates, getCitiesGroupedByState } from './data';
import { SourcesModel } from '../Model/Sources';

export async function getAllLeads(req: Request, res: Response) {
    const queryPage = parseInt(req.query?.page as string, 10);
    const page = Number.isNaN(queryPage) || queryPage <= 0 ? 0 : queryPage - 1;
    const pageSize = parseInt(process.env.PAGE_LIMIT, 10);

    const data = await LeadModel.find({})
        .skip(page * pageSize)
        .limit(pageSize)
        .sort({ verifiedOn: -1 })
        .lean();

    if (!data) {
        throw new RequestError(404, 'No Leads Present');
    }

    res.json({
        status: 'success',
        leads: data,
    });
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

function processText(text: String): Lead {
    // const contactRegex = /(\b\d{9,12}\b)/i;
    const lowerText = text.toLowerCase();
    const lead = {} as Lead;
    lead.resource = [];
    lead.plasma = [];

    // Fetch cities from text
    // eslint-disable-next-line no-restricted-syntax
    for (const city of getCities()) {
        if (lowerText.includes(city.toLowerCase())) {
            lead.city = city;
            break;
        }
    }
    if (!lead.city) throw new RequestError(400, 'Cannot parse city');

    // Fetch states from text
    // eslint-disable-next-line no-restricted-syntax
    for (const state of getStates()) {
        if (lowerText.includes(state.toLowerCase())) {
            lead.state = state;
            break;
        }
    }

    // Add state from city if state not found.
    if (!lead.state) {
        const states = getCitiesGroupedByState();
        // eslint-disable-next-line no-restricted-syntax
        for (const state of Object.keys(states)) {
            if (states[state].includes(lead.city)) {
                lead.state = state;
                break;
            }
        }
    }

    // wtf?
    if (!lead.state) throw new RequestError(500, `Cannot parse state for city: ${lead.city}`);

    // Fetch resources from text
    // eslint-disable-next-line no-restricted-syntax
    for (const resource of Object.values(Resource)) {
        // Add dictionaries here.
        if (lowerText.includes(resource.toLowerCase())) {
            lead.resource.push(resource);
        }
    }

    // Fetch plasma from text
    if (lowerText.includes('plasma')) {
        lead.resource.push(Resource.plasma);
        // eslint-disable-next-line no-restricted-syntax
        for (const plasma of Object.values(Plasma)) {
            if (lowerText.includes(plasma.toLowerCase())) {
                lead.plasma.push(plasma);
            }
        }
    }

    // Fetch resource match patch
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(ResourceMatch)) {
        // eslint-disable-next-line no-continue
        if (lead.resource.includes(key as Resource)) continue;
        // eslint-disable-next-line no-restricted-syntax
        for (const resourceStr of ResourceMatch[key]) {
            if (lowerText.includes(resourceStr.toLowerCase())) {
                if (!Object.values(Resource).includes(key as Resource)) {
                    throw new RequestError(500, `inconsistent Resource in map, please contact backend admin: ${key}`);
                }
                lead.resource.push(key as Resource);
                break;
            }
        }
    }

    if (lead.resource.length === 0) throw new RequestError(400, 'Cannot parse resources');

    // Fetch contact numbers from text
    // eslint-disable-next-line max-len
    // lead.contact = (lowerText.match(contactRegex) || []).map((e: any) => e.replace(contactRegex, '$1')) || [];
    return lead;
}

async function getSourceFromId(id: string) {
    if (!id) throw new RequestError(400, 'sourceId is missing');
    const source = await SourcesModel.findById(id).lean();
    if (!source) throw new RequestError(404, 'source not found or wrong sourceId');
    return { sourceName: source.sourceName, sourceURL: source.sourceURL };
}

/**
 *  POST /api/lead/
 *  payload: {
 *      text: "lorem ipsum", // Need to extract data from this text automatically
 *      sourceId: "",
 *      contact: [
 *          "9876543211",
 *          "9988775545"
 *      ]
 *  }
 *
 */

// Data is automatically extracted from the "text"
// "sourceId" makes the route semi-private, protecting us from spam.
export async function createLead(req: Request, res: Response) {
    const contactRegex = /(\b\d{9,12}\b)/i;
    const { text, contacts, sourceId } = req.body;
    if (!text || !contacts || !sourceId) throw new RequestError(400, 'missing parameters');
    // eslint-disable-next-line no-restricted-syntax
    for (const phone of contacts) {
        if (!contactRegex.test(phone)) {
            throw new RequestError(400, `malformed contact: ${phone}`);
        }
    }
    const leadFromText = processText(text);
    const source = await getSourceFromId(sourceId);

    const lead = plainToClass(Lead, {
        // All newly created leads are set to unverified.
        ...leadFromText,
        source,
        contact: contacts,
        rawText: text,
        verificationState: source ? VerificationState.source : VerificationState.notVerified,
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

export async function strictSearch(req: Request, res: Response) {
    const queries = [...new Set((req.query?.q as string).split(', '))]; // This removes duplicates.
    const keywordRegex = new RegExp(queries.map((q) => (`(${q})`)).join('|'), 'i');

    // const queryPage = parseInt(req.query?.page as string, 10);
    // const page = Number.isNaN(queryPage) || queryPage <= 0 ? 0 : queryPage - 1;
    // const pageSize = parseInt(process.env.PAGE_LIMIT, 10);
    const leadsData = await LeadModel.find({}).lean();

    const data = classToPlain(leadsData);

    const result = data.filter((doc: any) => {
        const groupsFound = new Set();
        Object.keys(doc).forEach((key) => {
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
        });
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

export async function keywordSearch(req: Request, res: Response) {
    const queries = req.query.q as string;
    const keywordRegex = new RegExp(queries.split(', ').join('|'), 'gi');

    // const queryPage = parseInt(req.query?.page as string, 10);
    // const page = Number.isNaN(queryPage) || queryPage <= 0 ? 0 : queryPage - 1;
    // const pageSize = parseInt(process.env.PAGE_LIMIT, 10);
    const leadsData = await LeadModel.find({}).lean();

    const data = classToPlain(leadsData);

    const result = data.filter((doc: any) => {
        req.log({
            keys: Object.keys(doc),
        });

        // eslint-disable-next-line no-restricted-syntax
        for (const key of Object.keys(doc)) {
            if (keywordRegex.test(doc[key])) {
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
        totalPages: 100,
    });
}
