// src/types/api.ts
export interface ResponseDTO<T = any> {
  status?: string;
  message?: string;
  data?: T;
}
