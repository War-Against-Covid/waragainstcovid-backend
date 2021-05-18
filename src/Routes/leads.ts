import { Router } from 'express';
import {
    getAllLeads, getLeadById, getVerifiedLeads, createLead, queryLead, queryLead2,
} from '../Controller/leads';

const router = Router();

router.get('/', getAllLeads);

router.get('/verified', getVerifiedLeads);

router.get('/query', queryLead);
router.get('/query2', queryLead2);

router.get('/:id', getLeadById);

router.post('/', createLead);

export default router;
