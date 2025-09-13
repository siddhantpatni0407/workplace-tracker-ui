// src/services/holidayService.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { HolidayDTO } from "../types/holiday";
import { ResponseDTO } from "../types/api";

/**
 * Holiday service wrapper for API calls.
 * - Uses a local axios instance
 * - Adds Authorization header if token present
 * - Normalizes responses (ResponseDTO vs raw body)
 */

const client: AxiosInstance = axios.create({
  baseURL: "", // endpoints in API_ENDPOINTS contain full URL
  timeout: 15000,
});

/**
 * Helper to safely set Authorization header regardless of header implementation.
 * Axios config.headers may be either plain object or AxiosHeaders instance.
 */
function setAuthHeader(config: AxiosRequestConfig, token: string) {
  if (!config.headers) {
    config.headers = { Authorization: `Bearer ${token}` } as any;
    return;
  }

  const h: any = config.headers;
  if (typeof h.set === "function") {
    h.set("Authorization", `Bearer ${token}`);
  } else {
    (config.headers as Record<string, string | number | boolean>)["Authorization"] = `Bearer ${token}`;
  }
}

// attach token automatically (if present)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    setAuthHeader(config, token);
  }
  return config;
});

const holidayService = {
  /**
   * Returns array of holidays. Backend may return plain array or ResponseDTO.
   */
  async getHolidays(from?: string, to?: string): Promise<HolidayDTO[]> {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await client.get<any>(API_ENDPOINTS.HOLIDAYS.GET_ALL, { params });
    if (res.data && typeof res.data === "object" && "data" in res.data && res.data.data !== undefined) {
      return res.data.data as HolidayDTO[];
    }
    return res.data as HolidayDTO[];
  },

  async createHoliday(payload: Partial<HolidayDTO>): Promise<HolidayDTO> {
    const res = await client.post<ResponseDTO<HolidayDTO>>(API_ENDPOINTS.HOLIDAYS.CREATE, payload);
    return res.data?.data ?? (res.data as any);
  },

  async updateHoliday(holidayId: number, payload: Partial<HolidayDTO>): Promise<HolidayDTO> {
    const res = await client.put<ResponseDTO<HolidayDTO>>(API_ENDPOINTS.HOLIDAYS.GET_ALL, payload, {
      params: { holidayId },
    });
    return res.data?.data ?? (res.data as any);
  },

  async deleteHoliday(holidayId: number): Promise<ResponseDTO<void>> {
    const res = await client.delete<ResponseDTO<void>>(API_ENDPOINTS.HOLIDAYS.GET_ALL, {
      params: { holidayId },
    });
    return res.data ?? { status: "SUCCESS", message: "Deleted" };
  },
};

export default holidayService;
