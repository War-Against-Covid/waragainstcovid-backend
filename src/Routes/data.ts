import { Router } from 'express';
import { getAllCities, getAllStates } from '../Controller/data';

const router = Router();

router.get('/all-cities', getAllCities);
router.get('/all-states', getAllStates);

export default router;
