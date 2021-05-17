/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable max-len */
import { Exclude, Expose } from 'class-transformer';
import { getModelForClass, prop } from '@typegoose/typegoose';
import { Length, IsNotEmpty, IsEnum } from 'class-validator';
import DocumentCT from './Base';

// re-implement base Document to allow class-transformer to serialize/deserialize its properties

// eslint-disable-next-line no-shadow
enum UserType {
  // eslint-disable-next-line no-unused-vars
  admin = 'admin',
  // eslint-disable-next-line no-unused-vars
  scout = 'scout',
}

@Exclude()
export class User extends DocumentCT {
  @prop({ required: true })
  @Expose()
  @Length(3, 20)
  public fullName!: string;

  @prop({ required: true })
  @Expose()
  @Length(3, 20)
  public username!: string;

  @prop({ required: true })
  @Expose()
  @IsNotEmpty()
  public encryptedPassword!: string;

  @prop({ default: 'scout', enum: UserType })
  @Expose()
  @IsNotEmpty()
  @IsEnum(UserType)
  public type!: UserType;
}

export const UserModel = getModelForClass(User);
