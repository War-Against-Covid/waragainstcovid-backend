import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { Contribute, ContributeModel } from '../Model/Contribute';
import { validateObject } from '../utils';
import { Contact, ContactModel } from '../Model/Contact';
import { Need, NeedModel, NeedStatus } from '../Model/Need';
import RequestError from '../utils/RequestError';

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
    let { resources, contact } = req.body;

    if (!contact) throw new RequestError(400, 'Contacts not specified!');
    if (!resources) throw new RequestError(400, 'Resources not specified!');

    contact = JSON.parse(contact);
    resources = JSON.parse(resources);
    const needObj = plainToClass(Need, {
        ...req.body,
        resource: resources,
        contact,
        status: NeedStatus.unresolved,
        createdOn: new Date(),
    });

    await validateObject(needObj);

    if (req.file) {
        const filePath = req.file.path.split('/').splice(1).join('/'); // Skip 'uploads/' in name
        needObj.prescriptionUrl = filePath;
    }

    const final = await NeedModel.create(needObj);

    res.json({
        status: 'success',
        need: final,
    });
}
