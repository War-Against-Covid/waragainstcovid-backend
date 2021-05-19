import { Router } from 'express';
import {
    getAllLeads, getLeadById, getVerifiedLeads, createLead, strictSearch, keywordSearch,
} from '../Controller/leads';

const router = Router();

router.get('/', getAllLeads);

router.get('/verified', getVerifiedLeads);

router.get('/strictSearch', strictSearch);

router.get('/keywordSearch', keywordSearch);

router.get('/:id', getLeadById);

router.post('/', createLead);

export default router;
