import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { Contribute, ContributeModel } from '../Model/Contribute';
import { validateObject } from '../utils';
import { Contact, ContactModel } from '../Model/Contact';

/* handle the contribution form */
export async function handleContributeForm(req: Request, res: Response) {
    const contribute = plainToClass(Contribute, {
        ...req.body,
    });
    await validateObject(contribute);
    await ContributeModel.create(contribute);
    res.json({
        status: 'success',
        message: 'Contribution Created',
        contribute,
    });
    res.json({ status: 'success' });
}

/* handle the contact form */
export async function handleContactForm(req: Request, res: Response) {
    const contact = plainToClass(Contact, {
        ...req.body,
    });
    await validateObject(contact);
    await ContactModel.create(contact);
    res.json({
        status: 'success',
        message: 'contact sent',
        contact,
    });
}

/* handle the post your need form */
export async function handlePostYourNeedForm(req: Request, res: Response) {
    const { state, city, phone } = req.body;
    res.json({
        status: 'success',
        message: `${state} ${city} ${phone}`,
    });
}
