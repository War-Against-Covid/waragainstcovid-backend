import { Expose } from 'class-transformer';
import { getModelForClass, prop } from '@typegoose/typegoose';
import {
    IsNotEmpty, MinLength, IsEmail,
} from 'class-validator';
import DocumentCT from './Base';

// name, email, message
export class Contact extends DocumentCT {
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
    public message: string;
}

export const ContactModel = getModelForClass(Contact);
