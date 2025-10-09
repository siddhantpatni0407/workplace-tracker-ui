// src/services/leavePolicyService.ts
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { LeavePolicyDTO } from "../types/leavePolicy";
import axiosInstance from "./axiosInstance";

type ApiResponse<T> = {
  status?: string;
  message?: string;
  data?: T;
};

const getAll = async (): Promise<LeavePolicyDTO[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.LEAVE_POLICIES.GET_ALL);
  return response.data?.data ?? [];
};

const getById = async (policyId: number | string): Promise<LeavePolicyDTO> => {
  const response = await axiosInstance.get(API_ENDPOINTS.LEAVE_POLICIES.GET_EXACT(policyId));
  return response.data?.data;
};

const createPolicy = async (payload: Partial<LeavePolicyDTO>): Promise<LeavePolicyDTO> => {
  const response = await axiosInstance.post(API_ENDPOINTS.LEAVE_POLICIES.CREATE, payload);
  return response.data?.data;
};

const updatePolicy = async (
  policyId: number | string,
  payload: Partial<LeavePolicyDTO>
): Promise<LeavePolicyDTO> => {
  const response = await axiosInstance.put(API_ENDPOINTS.LEAVE_POLICIES.UPDATE(policyId), payload);
  return response.data?.data;
};

// ✅ assign to a named variable before exporting
const leavePolicyService = {
  getAll,
  getById,
  createPolicy,
  updatePolicy,
};

export default leavePolicyService;
