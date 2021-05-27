import { Router } from 'express';
import { handleContactForm, handleContributeForm } from '../Controller/forms';

const router = Router();

router.post('/contact', handleContactForm);
router.post('/contribute', handleContributeForm);

export default router;
