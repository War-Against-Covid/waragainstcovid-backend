/* eslint-disable no-underscore-dangle */
import { Request, Response } from 'express';
import { classToPlain, plainToClass } from 'class-transformer';
import { Lead, LeadModel } from '../Model/Leads';
import {
    Plasma, Resource, ResourceMatch, VerificationState,
} from '../utils/constants';
import RequestError from '../utils/RequestError';
import { validateObject } from '../utils';
import { getStates, getCitiesGroupedByState } from './data';
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

// TODO: Word boundary check
function processText(text: String): Lead {
    // const contactRegex = /(\b\d{9,12}\b)/i;
    const lowerText = text.toLowerCase();
    const lead = {} as Lead;
    lead.resource = [];
    lead.plasma = [];

    // Fetch states from text
    // eslint-disable-next-line no-restricted-syntax
    for (const state of getStates()) {
        if (lowerText.includes(state.toLowerCase())) {
            lead.state = state;
            break;
        }
    }

    if (!lead.state) throw new RequestError(400, 'Cannot parse state');

    // Fetch cities from text
    // eslint-disable-next-line no-restricted-syntax
    for (const city of getCitiesGroupedByState()[lead.state]) {
        if (lowerText.includes(city.toLowerCase())) {
            lead.city = city;
            break;
        }
    }

    if (!lead.city) throw new RequestError(400, 'Cannot parse city');

    // legacy code -- Probably not needed now
    // Checks if parsed city is of parsed state or not
    const states = getCitiesGroupedByState();
    let foundCity = false;
    // eslint-disable-next-line no-restricted-syntax
    for (const city of states[lead.state]) {
        if (city.toLowerCase() === lead.city.toLowerCase()) {
            foundCity = true;
            break;
        }
    }
    if (!foundCity) throw new RequestError(400, `Invalid State/City pair: State: ${lead.state}, City: ${lead.city}`);

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

// async function getSourceFromId(id: string) {
//     if (!id) throw new RequestError(400, 'sourceId is missing');
//     const source = await SourcesModel.findById(id).lean();
//     if (!source) throw new RequestError(404, 'source not found or wrong sourceId');
//     return { sourceName: source.sourceName, sourceURL: source.sourceURL };
// }

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
    const source = await SourcesModel.findById(sourceId);
    if (!source) throw new RequestError(400, 'invalid sourceId!');
    // eslint-disable-next-line no-restricted-syntax
    for (const phone of contacts) {
        if (!contactRegex.test(phone)) {
            throw new RequestError(400, `malformed contact: ${phone}`);
        }
    }
    const leadFromText = processText(text);
    // const source = await getSourceFromId(sourceId);

    const lead = plainToClass(Lead, {
        // All newly created leads are set to unverified.
        ...leadFromText,
        source: sourceId,
        contact: contacts,
        rawText: text,
        verificationState: VerificationState.source,
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
    const queryPage = parseInt(req.query?.page as string, 10);
    const page = Number.isNaN(queryPage) || queryPage <= 0 ? 0 : queryPage - 1;
    const pageSize = parseInt(process.env.PAGE_LIMIT, 10);
    const leadsData = await LeadModel.find({}).lean();

    const data = classToPlain(leadsData);

    const result = data.filter((doc: any) => {
        const groupsFound = new Set<string>();
        Object.keys(doc).forEach((key) => {
            const objValue = doc[key];
            if (keywordRegex.test(objValue)) {
                const matches: string[] = [];
                if (typeof objValue === 'object') {
                    Object.values(objValue).forEach((val) => {
                        if (typeof val === 'string' || typeof val === 'number') {
                            matches.push(String(val)?.match(keywordRegex)?.[0]);
                        }
                    });
                } else if (typeof objValue === 'string' || typeof objValue === 'number') {
                    matches.push(String(objValue)?.match(keywordRegex)?.[0]);
                }
                matches.forEach((match) => {
                    if (match) {
                        groupsFound.add(match.toLowerCase());
                    }
                });
            }
        });
        // console.log(groupsFound.size);
        // groupsFound.forEach((value) => {
        //     console.log(`gFound val: ${value}`);
        // });
        return groupsFound.size >= queries.length;
    });

    // Convert _id back to hex
    const final = result.map((elem: any) => {
        const temp = elem;
        temp._id = (temp._id.id as Buffer).toString('hex');
        return temp;
    });

    const totalPages = Math.ceil(final.length / pageSize);

    // page = 0 => 0, 10
    // page = 1 => 10, 20
    // page = 2 => 20, 30
    const finalRes = final.slice(page * pageSize, (page * pageSize) + pageSize);

    res.json({
        status: 'success',
        leads: finalRes,
        totalPages,
    });
}

export async function keywordSearch(req: Request, res: Response) {
    const queries = req.query.q as string;
    const keywordRegex = new RegExp(queries.split(', ').join('|'), 'gi');

    const queryPage = parseInt(req.query?.page as string, 10);
    const page = Number.isNaN(queryPage) || queryPage <= 0 ? 0 : queryPage - 1;
    const pageSize = parseInt(process.env.PAGE_LIMIT, 10);
    const leadsData = await LeadModel.find({}).lean();

    const data = classToPlain(leadsData);

    const result = data.filter((doc: any) => {
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

    const totalPages = Math.ceil(final.length / pageSize);

    // page = 0 => 0, 10
    // page = 1 => 10, 20
    // page = 2 => 20, 30
    const finalRes = final.slice(page * pageSize, (page * pageSize) + pageSize);

    res.json({
        status: 'success',
        leads: finalRes,
        totalPages,
    });
}
