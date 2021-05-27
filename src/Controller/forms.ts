import { Request, Response } from 'express';

/* handle the contribution form */
export function handleContributeForm(req: Request, res: Response) {
    const { name, email, phone } = req.body;
    console.log(name, email, phone);
    res.json({ status: 'success' });
}

/* handle the contact form */
export function handleContactForm(req: Request, res: Response) {
    const { name, email, message } = req.body;
    console.log(name, email, message);
    res.json({ status: 'success' });
}
