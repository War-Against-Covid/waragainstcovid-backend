import { Router } from 'express';
import {
    getAllCities,
    getAllCitiesGroupedByState,
    getAllStates,
    getLocationData,
    getResources,
} from '../Controller/data';

const router = Router();

router.get('/all-cities', getAllCities);
router.get('/all-cities-grouped', getAllCitiesGroupedByState);
router.get('/all-states', getAllStates);
router.get('/locations', getLocationData);
router.get('/resources', getResources);

export default router;
