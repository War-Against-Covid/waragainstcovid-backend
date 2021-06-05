import { Router } from 'express';
import {
    getAllCities,
    getAllCitiesGroupedByState,
    getAllStates,
    getAllScouts,
    getLocationData,
    getResources,
    getStats,
} from '../Controller/data';

const router = Router();

router.get('/all-cities', getAllCities);
router.get('/all-cities-grouped', getAllCitiesGroupedByState);
router.get('/all-states', getAllStates);
router.get('/all-scouts', getAllScouts);
router.get('/locations', getLocationData);
router.get('/resources', getResources);
router.get('/stats', getStats);

export default router;
