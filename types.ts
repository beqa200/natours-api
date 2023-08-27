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