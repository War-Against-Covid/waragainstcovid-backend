import { Router } from 'express';
import {
    getAllLeads, getLeadById, getVerifiedLeads, createLead,
} from '../Controller/leads';

const router = Router();

router.get('/', getAllLeads);

router.get('/verified', getVerifiedLeads);

router.get('/:id', getLeadById);

router.post('/', createLead);

export default router;
