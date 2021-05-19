import { Expose } from 'class-transformer';
import { getModelForClass, prop } from '@typegoose/typegoose';
import {
    IsNotEmpty, IsEnum, MinLength, MaxLength,
} from 'class-validator';
import DocumentCT from './Base';
import { Resource, Plasma, VerificationState } from '../utils/constants';

export class Lead extends DocumentCT {
    @prop({ required: true, type: [String], enum: Resource })
    @Expose()
    @IsEnum(Resource, { each: true })
    public resource: Resource[];

    @prop({ type: [String], enum: Plasma })
    @Expose()
    @IsEnum(Plasma, { each: true })
    public plasma?: Plasma[];

    // TODO: Add auto state detection from city.
    @prop({ required: true })
    @Expose()
    @IsNotEmpty()
    public state?: string;

    @prop({ required: true })
    @Expose()
    @IsNotEmpty()
    public city?: string;

    @prop({ required: true, enum: VerificationState })
    @Expose()
    @IsNotEmpty()
    @IsEnum(VerificationState)
    public verificationState: VerificationState;

    @prop({ required: true })
    @Expose()
    @IsNotEmpty()
    @MinLength(10, { each: true })
    @MaxLength(11, { each: true })
    public contact: string[];

    @prop()
    @Expose()
    public mapLink?: string;

    @prop()
    @Expose()
    public rawText?: string;

    @prop()
    @Expose()
    public comments?: string;

    @prop()
    @Expose()
    public verifiedOn?: Date;

    @prop()
    @Expose()
    public source?: string;

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

export const LeadModel = getModelForClass(Lead);
