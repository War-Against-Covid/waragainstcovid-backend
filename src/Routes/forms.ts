import { Router } from 'express';
import {
    handleContactForm,
    handleContributeForm,
    handlePostYourNeedForm,
} from '../Controller/forms';

const router = Router();

router.post('/contact', handleContactForm);
router.post('/contribute', handleContributeForm);
router.post('/post-need', handlePostYourNeedForm);

export default router;
