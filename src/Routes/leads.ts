import { Router } from 'express';
import {
    getAllLeads, getLeadById, getVerifiedLeads, createLead, queryLead,
} from '../Controller/leads';

const router = Router();

router.get('/', getAllLeads);

router.get('/verified', getVerifiedLeads);

router.get('/query', queryLead);

router.get('/:id', getLeadById);

router.post('/', createLead);

export default router;
