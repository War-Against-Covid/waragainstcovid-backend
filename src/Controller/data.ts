import { Request, Response } from 'express';
import { ResourcesCollapsed } from '../utils/constants';
import CITIES from '../utils/cities.json';

export function getStates() {
    let states = [];
    // here the states will be repeated, so we cast it into a Set and then back into an
    // array
    states = [...new Set(CITIES.map((data) => data.state.trim()))];
    states.sort((a, b) => a.localeCompare(b));
    return states;
}

export function getCities() {
    let cities = [];
    cities = CITIES.map((data) => data.city.trim());
    cities.sort((a, b) => a.localeCompare(b));
    return cities;
}

export function getCitiesGroupedByState(lowerCased = false) {
    const obj: { [key: string]: string[] } = {};
    const states = getStates();
    states.forEach((state) => {
        const stateArray: string[] = [];
        CITIES.forEach((data) => {
            if (data.state === state) {
                stateArray.push(lowerCased ? data.city.toLowerCase() : data.city);
            }
        });
        obj[lowerCased ? state.toLowerCase() : state] = stateArray;
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
        states: getStates(),
        status: 'success',
    });
}

/* get an object of all cities grouped by states */
export function getAllCitiesGroupedByState(_req: Request, res: Response) {
    res.json({
        data: getCitiesGroupedByState(),
        status: 'success',
    });
}

/* return all the data that the above do */
export function getLocationData(_req: Request, res: Response) {
    res.json({
        states: getStates(),
        cities: getCities(),
        data: getCitiesGroupedByState(),
        status: 'success',
    });
}

/* return all resources */
export function getResources(_req: Request, res: Response) {
    res.json({
        status: 'success',
        resources: ResourcesCollapsed,
    });
}
