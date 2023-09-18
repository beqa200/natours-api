import { Request } from "express";
export interface ErrorType extends Error {
  status: string;
  statusCode: number;
  isOperational: boolean;
  path?: string;
  value?: string;
  code?: number;
  keyValue?: keyValueType;
}

interface keyValueType {
  name: string;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  photo?: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  password: string;
  passwordConfirm: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;
  id: string

  createPasswordResetToken(): string;
  correctPassword(password: any, userPassword: any): Promise<string>;
  changedPasswordAfter(iat: number): string;
}

export interface RequestCustomType extends Request {
  user: UserDocument
} 