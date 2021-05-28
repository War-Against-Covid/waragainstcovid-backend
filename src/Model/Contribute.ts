import { Expose } from 'class-transformer';
import { getModelForClass, prop } from '@typegoose/typegoose';
import {
    IsNotEmpty, MinLength, MaxLength, IsEmail,
} from 'class-validator';
import DocumentCT from './Base';

// name, email, phone
export class Contribute extends DocumentCT {
    @prop({ required: true, type: String })
    @Expose()
    @IsNotEmpty()
    public name: string;

    @prop({ required: true })
    @Expose()
    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @prop()
    @Expose()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(13)
    public phone: string;
}

export const ContributeModel = getModelForClass(Contribute);
