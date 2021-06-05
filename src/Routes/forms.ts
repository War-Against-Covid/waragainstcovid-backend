import { Router } from 'express';
import {
    handleContactForm,
    handleContributeForm,
    handlePostYourNeedForm,
} from '../Controller/forms';
import { singleFileUpload } from '../utils';

const router = Router();
const needsUpload = singleFileUpload('./uploads/needs', 'prescription');

router.post('/contact', handleContactForm);
router.post('/contribute', handleContributeForm);
router.post('/post-need', needsUpload, handlePostYourNeedForm);

export default router;
