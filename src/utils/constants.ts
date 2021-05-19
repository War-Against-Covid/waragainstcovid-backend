/* eslint-disable no-multi-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
export const ENV = {
    TEST: 'TEST',
    DEV: 'DEV',
    PROD: 'PROD',
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
    helpLine                = 'Helpline',
    homeICU                 = 'Home ICU',
    normalBed               = 'Normal Bed',
    HRCTscan                = 'HRCT Scan',
    ICUbed                  = 'ICU Bed',
    liposomalAmphotericinB  = 'Liposomal Amphotericin B',
    mentalHealthCounselling = 'Mental Health Counselling',
    nebulizer               = 'Nebulizer',
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
    transportation          = 'Transportation',
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
    new                     = 'New Sourced',
    notVerified             = 'Not Verified',
    notReachable            = 'Contact Not Reachable',
    negative                = 'Negative Feedback from User',
    inProgress              = 'In Progress',
    verified                = 'Verified',
    outOfStock              = 'Out Of Stock',
    invalid                 = 'Invalid Do Not Show on Website',
}

export const BCRYPT_HASH_RATE = 12;
