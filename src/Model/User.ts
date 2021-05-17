/* eslint-disable max-classes-per-file */
/* eslint-disable max-len */
import { Exclude, Expose } from 'class-transformer';
import { getModelForClass, prop } from '@typegoose/typegoose';
import { Length, IsEmail } from 'class-validator';
import DocumentCT from './Base';

// re-implement base Document to allow class-transformer to serialize/deserialize its properties

@Exclude()
export class User extends DocumentCT {
  @prop()
  @Expose()
  @IsEmail()
  public email: string;

  @prop()
  @Expose()
  @Length(10, 20)
  public password: string;
}

export const UserModel = getModelForClass(User);

export default {};
