import { Request, Response } from 'express';
import CITIES from '../utils/cities.json';

function getStates() {
    let states = [];
    // here the states will be repeated, so we cast it into a Set and then back into an
    // array
    states = [...new Set(CITIES.map((data) => data.state.trim()))];
    return states;
}

function getCities() {
    let cities = [];
    cities = CITIES.map((data) => data.city.trim());
    return cities;
}

function getCitiesGroupedByState() {
    const obj: { [key: string]: Array<string> } = {};
    const states = getStates();
    states.forEach((state) => {
        const stateArray: string[] = [];
        CITIES.forEach((data) => {
            if (data.state === state) {
                stateArray.push(data.city);
            }
        });
        obj[state] = stateArray;
    });
    return obj;
}

/* return an array of all indian cities */
export function getAllCities(_req: Request, res: Response) {
    res.json({
        cities: getCities(),
        status: 'success',
    });
}

/* get an array of all indian states */
export function getAllStates(_req: Request, res: Response) {
    res.json({
        cities: getStates(),
        status: 'success',
    });
}

/* get an object of all cities grouped by states */
export function getAllCitiesGroupedByState(_req: Request, res: Response) {
    res.json({
        cities: getCitiesGroupedByState(),
        status: 'success',
    });
}
