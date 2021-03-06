/* eslint-disable no-use-before-define */
/* eslint-disable func-names */
import { Expose } from 'class-transformer';
import {
    getModelForClass, prop, Ref, Pre,
} from '@typegoose/typegoose';
import {
    IsNotEmpty, IsEnum, MinLength, MaxLength,
} from 'class-validator';
import DocumentCT from './Base';
import { Resource, Plasma, VerificationState } from '../utils/constants';
import { Sources } from './Sources';

@Pre<Lead>('find', function () {
    this.populate('source');
})
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

    @prop({ required: true, type: [String] })
    @Expose()
    @IsNotEmpty()
    @MinLength(9, { each: true })
    @MaxLength(13, { each: true })
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

    @prop({ ref: () => Sources })
    @Expose()
    public source?: Ref<Sources>;

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
