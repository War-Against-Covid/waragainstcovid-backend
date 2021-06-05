/* eslint-disable no-multi-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
export const ENV = {
    TEST: 'TEST',
    DEV: 'DEV',
    PROD: 'PROD',
};

export const ResourceMatch: { [key: string]: string[] } = {
    'Air Ambulance': ['Air Ambulances'],
    Ambulance: ['Ambulances'],
    'BiPap Machine': ['BiPap Machines'],
    Doctor: ['Doctors', 'Doc', 'Docs'],
    'E-Consult Doctor': ['E-Consult Doctors', 'E-Doc', 'E-Docs', 'EDoc', 'EDocs', 'E Doc', 'E Docs'],
    'ECMO Beds': ['ECMO Bed', 'ECMO'],
    Flowmeter: ['Flowmeters'],
    'Food Delivery': ['Food Deliveries'],
    'Hospital Bed': ['Hospital bed', 'Hospital beds', 'Normal Bed', 'bed'],
    'HRCT Scan': ['HRCT Scans', 'HRCT'],
    'ICU Bed': ['ICU Beds', 'ICU'],
    'Mental Health Counselling': ['Mental Health', 'Mental Counselling'],
    'Oxygen Beds': ['Oxygen Bed', 'Oxy Bed', 'Oxy Beds'],
    'Oxygen Can': ['Oxygen Cans', 'Oxygen Can', 'Oxy can', 'Oxy cans'],
    'Oxygen Concentrator': ['Oxygen Concentrators', 'Concentrator', 'Concentrators'],
    'Oxygen Cylinder': ['Oxygen Cylinders', 'Cylinder', 'Cylinders'],
    'Oxygen Kit': ['Oxygen Kits', 'Oxy kit', 'Oxy kits', 'Oxi kit', 'Oxi kits'],
    'Oxygen Refilling': ['Oxygen Refillings', 'Oxy Refillings', 'Oxy Refilling'],
    Oxymeter: ['Oxymeters', 'Oximeter', 'Oximeters'],
    'RTPCR Testing': ['RTPCR Testings', 'RTPCR'],
    Telemedicine: ['Telemedicines'],
    Transportation: ['Transportations'],
    Ventilator: ['Ventilators', 'Venti bed', 'venti bed', 'venti Bed', 'Venti Bed'],
};

// eslint-disable-next-line no-shadow
export enum Resource {
    airAmbulance            = 'Air Ambulance',
    ambulance               = 'Ambulance',
    bevacizumab             = 'Bevacizumab',
    bipapMachine            = 'BiPap Machine',
    doctor                  = 'Doctor',
    eDoctor                 = 'E-Consult Doctor',
    ECMObeds                = 'ECMO Beds',
    fabiFlu                 = 'FabiFlu',
    favipiravir             = 'Favipiravir',
    flowmeter               = 'Flowmeter',
    foodDelivery            = 'Food Delivery',
    generalHelp             = 'General Help',
    helpLine                = 'Helpline', // Missing
    homeICU                 = 'Home ICU',
    hospitalBed             = 'Hospital Bed',
    isolationBed            = 'Isolation Beds',
    HRCTscan                = 'HRCT Scan',
    ICUbed                  = 'ICU Bed',
    liposomalAmphotericinB  = 'Liposomal Amphotericin B',
    mentalHealthCounselling = 'Mental Health Counselling',
    nebulizer               = 'Nebulizer', // Missing
    otherInfections         = 'Other Injections',
    otherMedicines          = 'Other Medicines',
    oxygenBeds              = 'Oxygen Beds',
    oxygenCan               = 'Oxygen Can',
    oxygenConcentrator      = 'Oxygen Concentrator',
    oxygenCylinder          = 'Oxygen Cylinder',
    oxygenKit               = 'Oxygen Kit',
    oxygenRefilling         = 'Oxygen Refilling',
    oxymeter                = 'Oxymeter',
    plasma                  = 'Plasma',
    remdesivir              = 'Remdesivir',
    RTPCRtesting            = 'RTPCR Testing',
    telemedicine            = 'Telemedicine',
    tocilizumab             = 'Tocilizumab',
    transportation          = 'Transportation', // Missing
    ventilator              = 'Ventilator',
}
// eslint-disable-next-line no-shadow
export enum Plasma {
    blood_A                 = 'A+',
    blood_A_neg             = 'A-',
    blood_B                 = 'B+',
    blood_B_neg             = 'B-',
    blood_AB                = 'AB+',
    blood_AB_neg            = 'AB-',
    blood_O                 = 'O+',
    blood_O_neg             = 'O-',
}
// eslint-disable-next-line no-shadow
export enum VerificationState {
    notVerified             = 'Not Verified',
    notReachable            = 'Contact Not Reachable',
    negative                = 'Negative Feedback from User',
    inProgress              = 'In Progress',
    verified                = 'Verified',
    outOfStock              = 'Out Of Stock',
    invalid                 = 'Invalid Do Not Show on Website',
    source                  = 'Sourced',
}

export const ResourcesCollapsed = {
    Oxygen: [
        'Oxygen Beds',
        'Oxygen Can',
        'Oxygen Concentrator',
        'Oxygen Cylinder',
        'Oxygen Kit',
        'Oxygen Refilling',
        'Flowmeter',
        'Oxymeter',
    ],
    'Beds and Equipments': [
        'Hospital Beds',
        'Isolation Beds',
        'ECMO Beds',
        'Oxygen Beds',
        'ICU Bed',
        'Ventilator',
        'Home ICU',
        'BiPap Machine',
    ],
    Testing: [
        'RTPCR Testing',
        'HRCT Scan',
    ],
    Medicine: [
        'Bevacizumab',
        'Fabiflu',
        'Favipiravir ',
        'Remdesivir',
        'Tocilizumab ',
        'Liposomal Amphotericin B',
        'Telemedicine',
        'Other Injections',
        'Other Medicine',
    ],
    'Medical Professionals': [
        'Doctor',
        'E-Consult Doctor',
        'Mental Health Counselling',
    ],
    Transportation: [
        'Ambulance',
        'Air Ambulance',
    ],
    Plasma: [
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-',
    ],
    'General Help': [] as any[],
    'Food Delivery': [] as any[],
};

export const BCRYPT_HASH_RATE = 12;
