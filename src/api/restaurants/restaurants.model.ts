import { Request } from 'express';

export interface IRegisterData {
  email: string;
  password: string;
  name: string;
  address?: string;
  locationX: number;
  locationY: number;
};

export interface ILoginData {
  email: string;
  password: string;
  mfaToken: string;
};

export interface IRegisterRequest extends Request<any, any, IRegisterData> { }
export interface ILoginRequest extends Request<any, any, ILoginData> { }
