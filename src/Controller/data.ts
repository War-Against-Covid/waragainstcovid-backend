import { Request, Response } from 'express';
import CITIES from '../utils/cities.json';

/* return an array of all indian cities */
export function getAllCities(_req: Request, res: Response) {
    let cities = [];
    cities = CITIES.map((data) => data.city);
    res.json({
        cities,
        status: 'success',
    });
}

/* get an array of all indian states */
export function getAllStates(_req: Request, res: Response) {
    let states = [];
    // here the states will be repeated, so we cast it into a Set and then back into an
    // array
    states = [...new Set(CITIES.map((data) => data.state))];
    res.json({
        cities: states,
        status: 'success',
    });
}
