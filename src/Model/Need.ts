/* eslint-disable no-unused-vars */
import { Expose } from 'class-transformer';
import { getModelForClass, prop } from '@typegoose/typegoose';
import {
    IsNotEmpty, IsEnum, MinLength, MaxLength,
} from 'class-validator';
import DocumentCT from './Base';
import { Resource, Plasma } from '../utils/constants';

// eslint-disable-next-line no-shadow
export enum NeedStatus {
    // eslint-disable-next-line no-unused-vars
    resolved = 'Resolved',
    // eslint-disable-next-line no-unused-vars
    inprogress = 'In Progress',
    // eslint-disable-next-line no-unused-vars
    unresolved = 'Unresolved',
}

export class Need extends DocumentCT {
    @prop()
    @Expose()
    public prescriptionUrl: string;

    @prop({ required: true })
    @Expose()
    @IsNotEmpty()
    public name: string;

    @prop({ required: true, type: [String], enum: Resource })
    @Expose()
    @IsEnum(Resource, { each: true })
    public resource: Resource[];

    // TODO: Add auto state detection from city.
    @prop({ required: true })
    @Expose()
    @IsNotEmpty()
    public state?: string;

    @prop({ required: true })
    @Expose()
    @IsNotEmpty()
    public city?: string;

    // @prop({ required: true, enum: VerificationState })
    // @Expose()
    // @IsNotEmpty()
    // @IsEnum(VerificationState)
    // public verificationState: VerificationState;

    @prop({ required: true })
    @Expose()
    @IsNotEmpty()
    @MinLength(9, { each: true })
    @MaxLength(13, { each: true })
    public contact: string[];

    @prop({ required: true, enum: NeedStatus })
    @Expose()
    @IsNotEmpty()
    @IsEnum(NeedStatus)
    public status: NeedStatus;

    @prop()
    @Expose()
    public lastUpdated?: Date;

    @prop()
    @Expose()
    public updatedBy?: string;

    @prop()
    @Expose()
    @IsNotEmpty()
    public createdOn: Date;
}

export const NeedModel = getModelForClass(Need);
