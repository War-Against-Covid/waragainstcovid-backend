import { Router } from 'express';
import {
    getAllCities,
    getAllCitiesGroupedByState,
    getAllStates,
} from '../Controller/data';

const router = Router();

router.get('/all-cities', getAllCities);
router.get('/all-cities-grouped', getAllCitiesGroupedByState);
router.get('/all-states', getAllStates);

export default router;
