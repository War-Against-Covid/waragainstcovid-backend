import { Expose } from 'class-transformer';
import { getModelForClass, prop } from '@typegoose/typegoose';
import { IsNotEmpty } from 'class-validator';
import DocumentCT from './Base';

export class Sources extends DocumentCT {
    @prop({ required: true, type: String })
    @Expose()
    @IsNotEmpty()
    public sourceName: string;

    @prop()
    @Expose()
    public sourceURL: string;
}

export const SourcesModel = getModelForClass(Sources);
