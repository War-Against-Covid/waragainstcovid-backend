import { Router } from 'express';
import { plainToClass } from 'class-transformer';
import { validateObject } from '../utils/utils';
import { Lead, LeadModel } from '../Model/Lead';
import RequestError from '../utils/RequestError';

const router = Router();

router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'TODO',
    });
});

router.get('/lead', async (req, res) => {
    const data = await LeadModel.find({});

    if (!data) {
        throw new RequestError(404, 'No Leads Present');
    } else {
        res.json({
            data,
        });
    }
});

router.get('/lead/:id', async (req, res) => {
    const data = await LeadModel.findById(req.params.id);

    if (!data) {
        throw new RequestError(404, 'Lead Not Found');
    } else {
        res.json({
            data,
        });
    }
});

router.post('/lead', async (req, res) => {
    const lead = plainToClass(Lead, { ...req.body });
    req.log(lead);
    await validateObject(lead);
    const doc = await LeadModel.create(lead);
    req.log(doc);
    res.json({
        status: 'success',
        message: 'Lead Created',
    });
});

export default router;
