// src/services/leavePolicyService.ts
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { LeavePolicyDTO } from "../types/leavePolicy";
import { HTTP } from "../constants/app";

type ApiResponse<T> = {
  status?: string;
  message?: string;
  data?: T;
};

async function handleFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    // try parse body for message
    const body = await res.json().catch(() => ({}));
    const msg = body?.message || res.statusText || "Request failed";
    throw new Error(msg);
  }
  const body = (await res.json()) as ApiResponse<T>;
  return body.data as T;
}

const getAll = async (): Promise<LeavePolicyDTO[]> => {
  return handleFetch<LeavePolicyDTO[]>(API_ENDPOINTS.LEAVE_POLICIES.GET_ALL);
};

const getById = async (policyId: number | string): Promise<LeavePolicyDTO> => {
  return handleFetch<LeavePolicyDTO>(API_ENDPOINTS.LEAVE_POLICIES.GET_EXACT(policyId));
};

const createPolicy = async (payload: Partial<LeavePolicyDTO>): Promise<LeavePolicyDTO> => {
  return handleFetch<LeavePolicyDTO>(API_ENDPOINTS.LEAVE_POLICIES.CREATE, {
    method: "POST",
    headers: HTTP.HEADERS.JSON,
    body: JSON.stringify(payload),
  });
};

const updatePolicy = async (
  policyId: number | string,
  payload: Partial<LeavePolicyDTO>
): Promise<LeavePolicyDTO> => {
  return handleFetch<LeavePolicyDTO>(API_ENDPOINTS.LEAVE_POLICIES.UPDATE(policyId), {
    method: "PUT",
    headers: HTTP.HEADERS.JSON,
    body: JSON.stringify(payload),
  });
};

// ✅ assign to a named variable before exporting
const leavePolicyService = {
  getAll,
  getById,
  createPolicy,
  updatePolicy,
};

export default leavePolicyService;
