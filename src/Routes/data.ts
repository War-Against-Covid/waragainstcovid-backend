import { Router } from 'express';
import {
    getAllCities,
    getAllCitiesGroupedByState,
    getAllStates,
    getLocationData,
} from '../Controller/data';

const router = Router();

router.get('/all-cities', getAllCities);
router.get('/all-cities-grouped', getAllCitiesGroupedByState);
router.get('/all-states', getAllStates);
router.get('/locations', getLocationData);

export default router;
